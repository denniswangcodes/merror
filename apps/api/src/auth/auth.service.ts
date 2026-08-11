import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
  }

  private sanitize(user: { passwordHash: string; [key: string]: unknown }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email ? 'Email already in use' : 'Username already taken',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        username: dto.username,
        displayName: dto.displayName ?? dto.username,
        preferredLanguage: dto.preferredLanguage ?? 'en',
      },
    });

    const tokens = this.generateTokens(user.id, user.email);
    return { ...tokens, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.suspendedAt) throw new UnauthorizedException('Account suspended. Contact support for help.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = this.generateTokens(user.id, user.email);
    return { ...tokens, user: this.sanitize(user) };
  }

  async refresh(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.suspendedAt) throw new UnauthorizedException('Account suspended');

    const tokens = this.generateTokens(user.id, user.email);
    return { ...tokens, user: this.sanitize(user) };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new BadRequestException('Password is incorrect');

    const affected = await this.prisma.feedback.findMany({
      where: { giverId: userId, receiverId: { not: userId }, status: 'APPROVED' },
      distinct: ['receiverId'],
      select: { receiverId: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } });
      for (const { receiverId } of affected) {
        if (!receiverId) continue;
        const aggregate = await tx.feedback.aggregate({ where: { receiverId, status: 'APPROVED' }, _sum: { points: true } });
        await tx.user.update({ where: { id: receiverId }, data: { totalPoints: aggregate._sum.points ?? 0 } });
      }
    });
    return { message: 'Account and associated content deleted' };
  }
}
