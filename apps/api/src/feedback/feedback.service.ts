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
  recipientName: true,
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
  _count: { select: { likes: true, comments: true } },
};

type RawFeedback = { _count: { likes: number; comments: number } } & Record<string, unknown>;

function withCounts<T extends RawFeedback>(item: T) {
  const { _count, ...rest } = item;
  return { ...rest, likeCount: _count.likes, commentCount: _count.comments };
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(giverId: string, dto: CreateFeedbackDto) {
    this.assertSafeText(dto.message);
    if (dto.recipientName) this.assertSafeText(dto.recipientName);

    if (!dto.receiverId) {
      // Journal entry: a good deed for someone who isn't on Merror yet. The giver chooses whether it stays
      // private to their own wall or is published on their public profile.
      const journalEntry = await this.prisma.feedback.create({
        data: {
          giverId,
          receiverId: null,
          recipientName: dto.recipientName?.trim() || null,
          type: dto.type,
          message: dto.message,
          imageUrl: dto.imageUrl,
          isPublic: dto.isPublic ?? false,
          points: 0,
          status: 'APPROVED',
        },
        select: FEEDBACK_WITH_USERS,
      });
      return { ...withCounts(journalEntry), likedByMe: false };
    }

    if (giverId === dto.receiverId) {
      throw new BadRequestException('You cannot give feedback to yourself');
    }

    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');
    if (receiver.suspendedAt) throw new NotFoundException('Receiver not found');

    const blocked = await this.prisma.block.findFirst({
      where: { OR: [{ blockerId: giverId, blockedId: dto.receiverId }, { blockerId: dto.receiverId, blockedId: giverId }] },
      select: { id: true },
    });
    if (blocked) throw new ForbiddenException('You cannot interact with this user');

    const recentDuplicate = await this.prisma.feedback.findFirst({
      where: {
        giverId,
        receiverId: dto.receiverId,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (recentDuplicate) throw new BadRequestException('Please wait before sending another reflection to this person');

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

    return { ...withCounts(feedback), likedByMe: false };
  }

  /** Merges the viewer's like state into a page of feedback, and normalizes _count into like/comment counts. */
  private async withViewerContext<T extends RawFeedback & { id: string }>(items: T[], viewerId: string) {
    const ids = items.map((item) => item.id);
    const likedIds = ids.length
      ? new Set(
          (await this.prisma.like.findMany({ where: { userId: viewerId, feedbackId: { in: ids } }, select: { feedbackId: true } })).map(
            (like) => like.feedbackId,
          ),
        )
      : new Set<string>();
    return items.map((item) => ({ ...withCounts(item), likedByMe: likedIds.has(item.id) }));
  }

  async getFeed(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const blocks = await this.prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const excludedIds = blocks.map((item) => item.blockerId === userId ? item.blockedId : item.blockerId);
    const where = {
      isPublic: true,
      status: 'APPROVED' as const,
      giverId: { notIn: excludedIds },
      receiverId: { notIn: excludedIds },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where }),
    ]);
    const data = await this.withViewerContext(rows, userId);

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
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { receiverId: userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { receiverId: userId, status: 'APPROVED' } }),
    ]);
    const data = await this.withViewerContext(rows, userId);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  async getGiven(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { giverId: userId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { giverId: userId, status: 'APPROVED' } }),
    ]);
    const data = await this.withViewerContext(rows, userId);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  /** Public lookup for a single reflection, used by shareable links. No auth required. */
  async getById(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId }, select: FEEDBACK_WITH_USERS });
    if (!feedback || !feedback.isPublic || feedback.status !== 'APPROVED') {
      throw new NotFoundException('Reflection not found');
    }
    return withCounts(feedback);
  }

  async getLikeStatus(userId: string, feedbackId: string) {
    const like = await this.prisma.like.findUnique({ where: { feedbackId_userId: { feedbackId, userId } }, select: { id: true } });
    return { liked: !!like };
  }

  async toggleLike(userId: string, feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId }, select: { id: true, giverId: true } });
    if (!feedback) throw new NotFoundException('Reflection not found');

    const existing = await this.prisma.like.findUnique({ where: { feedbackId_userId: { feedbackId, userId } }, select: { id: true } });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.like.create({ data: { feedbackId, userId } });
      if (feedback.giverId !== userId) {
        await this.notifications.create({ userId: feedback.giverId, type: 'FEEDBACK_LIKED', fromUserId: userId, referenceId: feedbackId }).catch(() => {});
      }
    }
    const likeCount = await this.prisma.like.count({ where: { feedbackId } });
    return { liked: !existing, likeCount };
  }

  async getComments(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId }, select: { id: true } });
    if (!feedback) throw new NotFoundException('Reflection not found');
    return this.prisma.comment.findMany({
      where: { feedbackId },
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true } } },
    });
  }

  async addComment(userId: string, feedbackId: string, message: string) {
    this.assertSafeText(message);
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId }, select: { id: true, giverId: true } });
    if (!feedback) throw new NotFoundException('Reflection not found');

    const comment = await this.prisma.comment.create({
      data: { feedbackId, userId, message: message.trim() },
      include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true } } },
    });
    if (feedback.giverId !== userId) {
      await this.notifications.create({ userId: feedback.giverId, type: 'FEEDBACK_COMMENTED', fromUserId: userId, referenceId: feedbackId }).catch(() => {});
    }
    return comment;
  }

  async removeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { feedback: { select: { giverId: true, receiverId: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId && comment.feedback.giverId !== userId && comment.feedback.receiverId !== userId) {
      throw new ForbiddenException('You cannot delete this comment');
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { deleted: true };
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
    return { ...withCounts(updated), likedByMe: false };
  }

  async updateImage(userId: string, feedbackId: string, imageUrl: string | null) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId }, select: { giverId: true } });
    if (!feedback) throw new NotFoundException('Reflection not found');
    if (feedback.giverId !== userId) {
      throw new ForbiddenException('Only the person who posted this reflection can change its photo');
    }
    const updated = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: { imageUrl },
      select: FEEDBACK_WITH_USERS,
    });
    return { ...withCounts(updated), likedByMe: false };
  }

  async remove(userId: string, feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback) throw new NotFoundException('Reflection not found');
    if (feedback.giverId !== userId && feedback.receiverId !== userId) {
      throw new ForbiddenException('Only the giver or receiver can delete this reflection');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { referenceId: feedbackId } });
      await tx.feedback.delete({ where: { id: feedbackId } });
      if (feedback.status === 'APPROVED' && feedback.points > 0 && feedback.receiverId) {
        const receiver = await tx.user.findUnique({ where: { id: feedback.receiverId }, select: { totalPoints: true } });
        if (receiver) {
          await tx.user.update({
            where: { id: feedback.receiverId },
            data: { totalPoints: Math.max(0, receiver.totalPoints - feedback.points) },
          });
        }
      }
    });

    return { deleted: true };
  }

  private assertSafeText(message: string) {
    const normalized = message.normalize('NFKC').toLowerCase();
    const blockedTerms = [
      /\bn[i1]gg(?:er|a)s?\b/i,
      /\bf[a@]gg?(?:ot|it)s?\b/i,
      /\bk[i1]ke?s?\b/i,
      /\bch[i1]nk?s?\b/i,
      /\bkill\s+(?:yourself|urself|you)\b/i,
    ];
    const spam = /(https?:\/\/\S+.*){3,}/i.test(normalized) || /(.)\1{14,}/u.test(normalized);
    if (spam || blockedTerms.some((pattern) => pattern.test(normalized))) {
      throw new BadRequestException('This reflection may violate the Community Guidelines. Please revise it.');
    }
  }
}
