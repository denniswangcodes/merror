import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  displayName: true,
  username: true,
  avatarUrl: true,
  bio: true,
  qrCode: true,
  role: true,
  preferredLanguage: true,
  totalPoints: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string) {
    if (!q || q.length < 1) return [];
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_USER_SELECT,
      take: 20,
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...PUBLIC_USER_SELECT,
        feedbackReceived: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            giver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        ...PUBLIC_USER_SELECT,
        feedbackReceived: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            giver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          },
        },
        feedbackGiven: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            receiver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByQrCode(qrCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { qrCode },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw new NotFoundException('QR code not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: PUBLIC_USER_SELECT,
    });
    return user;
  }
}
