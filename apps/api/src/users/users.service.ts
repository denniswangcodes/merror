import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PUBLIC_USER_SELECT = {
  id: true,
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

  async search(q: string, viewerId: string) {
    if (!q || q.length < 1) return [];
    const excludedIds = await this.blockedUserIds(viewerId);
    return this.prisma.user.findMany({
      where: {
        id: { notIn: [viewerId, ...excludedIds] },
        suspendedAt: null,
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_USER_SELECT,
      take: 20,
    });
  }

  async findById(id: string, viewerId: string) {
    await this.assertVisible(viewerId, id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...PUBLIC_USER_SELECT,
        feedbackReceived: {
          where: { isPublic: true, status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            giver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const feedbackReceived = await this.withLikedByMe(user.feedbackReceived, viewerId);
    return { ...user, feedbackReceived };
  }

  async findByUsername(username: string, viewerId: string) {
    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw new NotFoundException('User not found');
    await this.assertVisible(viewerId, target.id);
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        ...PUBLIC_USER_SELECT,
        feedbackReceived: {
          where: { isPublic: true, status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            giver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
        feedbackGiven: {
          where: { isPublic: true, status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            receiver: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const [feedbackReceived, feedbackGiven] = await Promise.all([
      this.withLikedByMe(user.feedbackReceived, viewerId),
      this.withLikedByMe(user.feedbackGiven, viewerId),
    ]);
    return { ...user, feedbackReceived, feedbackGiven };
  }

  /** Normalizes _count into like/comment counts and merges in whether the viewer has liked each item. */
  private async withLikedByMe<T extends { id: string; _count: { likes: number; comments: number } }>(
    items: T[],
    viewerId: string,
  ) {
    const ids = items.map((item) => item.id);
    const likedIds = ids.length
      ? new Set(
          (await this.prisma.like.findMany({ where: { userId: viewerId, feedbackId: { in: ids } }, select: { feedbackId: true } })).map(
            (like) => like.feedbackId,
          ),
        )
      : new Set<string>();
    return items.map(({ _count, ...rest }) => ({ ...rest, likeCount: _count.likes, commentCount: _count.comments, likedByMe: likedIds.has(rest.id) }));
  }

  async findByQrCode(qrCode: string, viewerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { qrCode },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw new NotFoundException('QR code not found');
    await this.assertVisible(viewerId, user.id);
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
    const [given, received, givenThisWeek, receivedThisWeek] = await Promise.all([
      this.prisma.feedback.count({ where: { giverId: userId, status: 'APPROVED' } }),
      this.prisma.feedback.count({ where: { receiverId: userId, status: 'APPROVED' } }),
      this.prisma.feedback.count({ where: { giverId: userId, status: 'APPROVED', createdAt: { gte: since } } }),
      this.prisma.feedback.count({ where: { receiverId: userId, status: 'APPROVED', createdAt: { gte: since } } }),
    ]);
    return { given, received, givenThisWeek, receivedThisWeek };
  }

  async getAdminMetrics(userId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (admin?.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsers7d, activeUsers7d, approvedTotal, approved7d, pending, rejected, givers7d, receivers7d] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count({ where: { lastActiveAt: { gte: since } } }),
      this.prisma.feedback.count({ where: { status: 'APPROVED' } }),
      this.prisma.feedback.count({ where: { status: 'APPROVED', reviewedAt: { gte: since } } }),
      this.prisma.feedback.count({ where: { status: 'PENDING' } }),
      this.prisma.feedback.count({ where: { status: 'REJECTED' } }),
      this.prisma.feedback.groupBy({ by: ['giverId'], where: { status: 'APPROVED', reviewedAt: { gte: since } } }),
      this.prisma.feedback.groupBy({ by: ['receiverId'], where: { status: 'APPROVED', reviewedAt: { gte: since } } }),
    ]);
    const reviewed = approvedTotal + rejected;
    return {
      totalUsers, newUsers7d, activeUsers7d, approvedReflections: approvedTotal, approvedReflections7d: approved7d,
      pendingReflections: pending, approvalRate: reviewed ? Math.round((approvedTotal / reviewed) * 1000) / 10 : 0,
      uniqueGivers7d: givers7d.length, uniqueReceivers7d: receivers7d.length,
      approvedReflectionsPerActiveUser7d: activeUsers7d ? Math.round((approved7d / activeUsers7d) * 100) / 100 : 0,
    };
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

  private async blockedUserIds(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    return blocks.map((item) => item.blockerId === userId ? item.blockedId : item.blockerId);
  }

  private async assertVisible(viewerId: string, targetId: string) {
    if (viewerId === targetId) return;
    const blocked = await this.prisma.block.findFirst({
      where: { OR: [{ blockerId: viewerId, blockedId: targetId }, { blockerId: targetId, blockedId: viewerId }] },
      select: { id: true },
    });
    if (blocked) throw new ForbiddenException('This profile is unavailable');
  }
}
