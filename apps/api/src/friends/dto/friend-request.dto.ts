import { IsString, MinLength } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  @MinLength(1)
  targetUserId: string;
}
