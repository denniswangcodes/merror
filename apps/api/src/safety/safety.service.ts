import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, ReviewReportDto } from './dto/safety.dto';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    if (!dto.feedbackId && !dto.reportedUserId) throw new BadRequestException('Choose a reflection or user to report');
    if (dto.reportedUserId === reporterId) throw new BadRequestException('You cannot report yourself');

    let reportedUserId = dto.reportedUserId;
    if (dto.feedbackId) {
      const feedback = await this.prisma.feedback.findUnique({ where: { id: dto.feedbackId } });
      if (!feedback) throw new NotFoundException('Reflection not found');
      reportedUserId ??= feedback.giverId;
    }

    return this.prisma.report.create({
      data: { reporterId, reportedUserId, feedbackId: dto.feedbackId, reason: dto.reason, details: dto.details },
      select: { id: true, status: true, createdAt: true },
    });
  }

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('You cannot block yourself');
    const target = await this.prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
    if (!target) throw new NotFoundException('User not found');
    await this.prisma.$transaction([
      this.prisma.block.upsert({ where: { blockerId_blockedId: { blockerId, blockedId } }, update: {}, create: { blockerId, blockedId } }),
      this.prisma.friendship.deleteMany({ where: { OR: [{ userAId: blockerId, userBId: blockedId }, { userAId: blockedId, userBId: blockerId }] } }),
      this.prisma.notification.deleteMany({ where: { OR: [{ userId: blockerId, fromUserId: blockedId }, { userId: blockedId, fromUserId: blockerId }] } }),
    ]);
    return { message: 'User blocked' };
  }

  async unblock(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({ where: { blockerId, blockedId } });
    return { message: 'User unblocked' };
  }

  getBlocked(blockerId: string) {
    return this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, blocked: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
  }

  async getReports(adminId: string) {
    await this.assertAdmin(adminId);
    return this.prisma.report.findMany({
      where: { status: 'OPEN' }, orderBy: { createdAt: 'asc' }, take: 100,
      include: {
        reporter: { select: { id: true, username: true, displayName: true } },
        reportedUser: { select: { id: true, username: true, displayName: true } },
        feedback: { select: { id: true, message: true, imageUrl: true, giverId: true, receiverId: true } },
      },
    });
  }

  async reviewReport(adminId: string, reportId: string, dto: ReviewReportDto) {
    await this.assertAdmin(adminId);
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    if (dto.action && dto.status !== 'ACTIONED') throw new BadRequestException('An action requires ACTIONED status');

    return this.prisma.$transaction(async (tx) => {
      if (dto.action === 'REMOVE_CONTENT') {
        if (!report.feedbackId) throw new BadRequestException('Report has no reflection');
        await tx.feedback.update({ where: { id: report.feedbackId }, data: { isPublic: false } });
      }
      if (dto.action === 'SUSPEND_USER') {
        if (!report.reportedUserId) throw new BadRequestException('Report has no user');
        await tx.user.update({ where: { id: report.reportedUserId }, data: { suspendedAt: new Date() } });
      }
      return tx.report.update({ where: { id: reportId }, data: { status: dto.status, moderatorNote: dto.moderatorNote, reviewedAt: new Date() } });
    });
  }

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
  }
}
