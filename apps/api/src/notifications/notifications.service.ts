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
    type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'FEEDBACK_RECEIVED' | 'FEEDBACK_APPROVED' | 'FEEDBACK_REJECTED';
    fromUserId?: string;
    referenceId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async getForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { fromUser: { select: FROM_USER_SELECT } },
    });
    const feedbackIds = notifications
      .filter((item) => item.type === 'FEEDBACK_RECEIVED' && item.referenceId)
      .map((item) => item.referenceId as string);
    const feedback = feedbackIds.length ? await this.prisma.feedback.findMany({
      where: { id: { in: feedbackIds }, receiverId: userId },
      select: { id: true, type: true, message: true, imageUrl: true, status: true },
    }) : [];
    const byId = new Map(feedback.map((item) => [item.id, item]));
    return notifications.map((item) => ({
      ...item,
      feedback: item.referenceId ? byId.get(item.referenceId) ?? null : null,
    }));
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
      // Reflection review requests remain actionable until approved or rejected.
      where: { userId, read: false, type: { not: 'FEEDBACK_RECEIVED' } },
      data: { read: true },
    });
    return { success: true };
  }
}
