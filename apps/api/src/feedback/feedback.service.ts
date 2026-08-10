import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const FEEDBACK_WITH_USERS = {
  id: true,
  giverId: true,
  receiverId: true,
  type: true,
  message: true,
  imageUrl: true,
  points: true,
  isPublic: true,
  createdAt: true,
  status: true,
  reviewedAt: true,
  giver: {
    select: { id: true, displayName: true, username: true, avatarUrl: true },
  },
  receiver: {
    select: { id: true, displayName: true, username: true, avatarUrl: true },
  },
};

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(giverId: string, dto: CreateFeedbackDto) {
    if (giverId === dto.receiverId) {
      throw new BadRequestException('You cannot give feedback to yourself');
    }

    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const feedback = await this.prisma.feedback.create({
        data: {
          giverId,
          receiverId: dto.receiverId,
          type: dto.type,
          message: dto.message,
          imageUrl: dto.imageUrl,
          isPublic: dto.isPublic ?? true,
          points: 1,
          status: 'PENDING',
        },
        select: FEEDBACK_WITH_USERS,
      });

    await this.notifications.create({
      userId: dto.receiverId,
      type: 'FEEDBACK_RECEIVED',
      fromUserId: giverId,
      referenceId: feedback.id,
    });

    return feedback;
  }

  async getFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { isPublic: true, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { isPublic: true, status: 'APPROVED' } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    };
  }

  async getReceived(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { receiverId: userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { receiverId: userId, status: 'APPROVED' } }),
    ]);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  async getGiven(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { giverId: userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { giverId: userId, status: 'APPROVED' } }),
    ]);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  async review(receiverId: string, feedbackId: string, approve: boolean) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback) throw new NotFoundException('Reflection not found');
    if (feedback.receiverId !== receiverId) {
      throw new ForbiddenException('You can only review reflections sent to you');
    }
    if (feedback.status !== 'PENDING') {
      throw new ConflictException('This reflection has already been reviewed');
    }

    const status = approve ? 'APPROVED' : 'REJECTED';
    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.feedback.updateMany({
        where: { id: feedbackId, receiverId, status: 'PENDING' },
        data: { status, reviewedAt: new Date() },
      });
      if (claimed.count !== 1) {
        throw new ConflictException('This reflection has already been reviewed');
      }
      if (approve) {
        await tx.user.update({
          where: { id: receiverId },
          data: { totalPoints: { increment: feedback.points } },
        });
      }
      await tx.notification.updateMany({
        where: { userId: receiverId, referenceId: feedbackId, type: 'FEEDBACK_RECEIVED' },
        data: { read: true },
      });
      return tx.feedback.findUniqueOrThrow({ where: { id: feedbackId }, select: FEEDBACK_WITH_USERS });
    });

    await this.notifications.create({
      userId: feedback.giverId,
      type: approve ? 'FEEDBACK_APPROVED' : 'FEEDBACK_REJECTED',
      fromUserId: receiverId,
      referenceId: feedbackId,
    });
    return updated;
  }
}
