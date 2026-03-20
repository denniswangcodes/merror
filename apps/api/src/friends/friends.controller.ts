import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendRequestDto } from './dto/friend-request.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('friends')
@UseGuards(JwtGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  sendRequest(@GetUser('id') userId: string, @Body() dto: FriendRequestDto) {
    return this.friendsService.sendRequest(userId, dto);
  }

  @Patch(':id/accept')
  acceptRequest(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.friendsService.acceptRequest(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.friendsService.remove(userId, id);
  }

  @Get()
  getFriends(@GetUser('id') userId: string) {
    return this.friendsService.getFriends(userId);
  }

  @Get('pending')
  getPending(@GetUser('id') userId: string) {
    return this.friendsService.getPending(userId);
  }
}
