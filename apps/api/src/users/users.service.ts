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

  async getLeaderboard() {
    return this.prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 10,
      select: { id: true, displayName: true, username: true, avatarUrl: true, totalPoints: true },
    });
  }

  async getMyStats(userId: string) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [given, received] = await Promise.all([
      this.prisma.feedback.count({ where: { giverId: userId, createdAt: { gte: since } } }),
      this.prisma.feedback.count({ where: { receiverId: userId, createdAt: { gte: since } } }),
    ]);
    return { given, received };
  }

  async getSuggestions(userId: string) {
    const myFriendships = await this.prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    });
    const excludeIds = new Set([
      userId,
      ...myFriendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId)),
    ]);
    const friendIds = myFriendships
      .filter((f) => true)
      .map((f) => (f.userAId === userId ? f.userBId : f.userAId));

    if (friendIds.length === 0) return [];

    const fofFriendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userAId: { in: friendIds } }, { userBId: { in: friendIds } }],
      },
      select: { userAId: true, userBId: true },
    });
    const suggestedIds = [
      ...new Set(
        fofFriendships
          .flatMap((f) => [f.userAId, f.userBId])
          .filter((id) => !excludeIds.has(id)),
      ),
    ].slice(0, 5);
    if (suggestedIds.length === 0) return [];
    return this.prisma.user.findMany({
      where: { id: { in: suggestedIds } },
      select: { id: true, displayName: true, username: true, avatarUrl: true, totalPoints: true },
      take: 3,
    });
  }
}
