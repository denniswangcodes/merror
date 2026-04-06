import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FROM_USER_SELECT = {
  id: true,
  displayName: true,
  username: true,
  avatarUrl: true,
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'FEEDBACK_RECEIVED';
    fromUserId?: string;
    referenceId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async getForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { fromUser: { select: FROM_USER_SELECT } },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }
}
