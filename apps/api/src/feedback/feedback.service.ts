import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const FEEDBACK_WITH_USERS = {
  id: true,
  giverId: true,
  receiverId: true,
  type: true,
  message: true,
  points: true,
  isPublic: true,
  createdAt: true,
  giver: {
    select: { id: true, displayName: true, username: true, avatarUrl: true },
  },
  receiver: {
    select: { id: true, displayName: true, username: true, avatarUrl: true },
  },
};

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(giverId: string, dto: CreateFeedbackDto) {
    if (giverId === dto.receiverId) {
      throw new BadRequestException('You cannot give feedback to yourself');
    }

    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const [feedback] = await this.prisma.$transaction([
      this.prisma.feedback.create({
        data: {
          giverId,
          receiverId: dto.receiverId,
          type: dto.type,
          message: dto.message,
          isPublic: dto.isPublic ?? true,
          points: 1,
        },
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.user.update({
        where: { id: dto.receiverId },
        data: { totalPoints: { increment: 1 } },
      }),
    ]);

    return feedback;
  }

  async getFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { isPublic: true } }),
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
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { receiverId: userId } }),
    ]);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }

  async getGiven(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where: { giverId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: FEEDBACK_WITH_USERS,
      }),
      this.prisma.feedback.count({ where: { giverId: userId } }),
    ]);
    return { data, total, page, limit, hasMore: skip + data.length < total };
  }
}
