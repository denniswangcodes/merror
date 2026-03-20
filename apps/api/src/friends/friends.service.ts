import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendRequestDto } from './dto/friend-request.dto';

const FRIENDSHIP_WITH_USERS = {
  id: true,
  userAId: true,
  userBId: true,
  status: true,
  createdAt: true,
  userA: {
    select: { id: true, displayName: true, username: true, avatarUrl: true, totalPoints: true },
  },
  userB: {
    select: { id: true, displayName: true, username: true, avatarUrl: true, totalPoints: true },
  },
};

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(userAId: string, dto: FriendRequestDto) {
    if (userAId === dto.targetUserId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const target = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
    if (!target) throw new NotFoundException('User not found');

    // Check if relationship already exists in either direction
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId, userBId: dto.targetUserId },
          { userAId: dto.targetUserId, userBId: userAId },
        ],
      },
    });
    if (existing) {
      throw new ConflictException(
        existing.status === 'ACCEPTED'
          ? 'Already friends'
          : 'Friend request already pending',
      );
    }

    return this.prisma.friendship.create({
      data: { userAId, userBId: dto.targetUserId, status: 'PENDING' },
      select: FRIENDSHIP_WITH_USERS,
    });
  }

  async acceptRequest(currentUserId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.userBId !== currentUserId) {
      throw new ForbiddenException('You can only accept requests sent to you');
    }
    if (friendship.status === 'ACCEPTED') {
      throw new BadRequestException('Already accepted');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
      select: FRIENDSHIP_WITH_USERS,
    });
  }

  async remove(currentUserId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship) throw new NotFoundException('Friendship not found');
    if (friendship.userAId !== currentUserId && friendship.userBId !== currentUserId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { message: 'Removed successfully' };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      select: FRIENDSHIP_WITH_USERS,
      orderBy: { createdAt: 'desc' },
    });
    return friendships;
  }

  async getPending(userId: string) {
    return this.prisma.friendship.findMany({
      where: { userBId: userId, status: 'PENDING' },
      select: FRIENDSHIP_WITH_USERS,
      orderBy: { createdAt: 'desc' },
    });
  }
}
