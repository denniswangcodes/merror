import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @UseGuards(JwtGuard)
  search(@GetUser('id') userId: string, @Query('q') q: string) {
    return this.usersService.search(q ?? '', userId);
  }

  @Get('qr/:qrCode')
  @UseGuards(JwtGuard)
  findByQrCode(@GetUser('id') userId: string, @Param('qrCode') qrCode: string) {
    return this.usersService.findByQrCode(qrCode, userId);
  }

  @Get('by-username/:username')
  @UseGuards(JwtGuard)
  findByUsername(@GetUser('id') userId: string, @Param('username') username: string) {
    return this.usersService.findByUsername(username, userId);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @Get('me/stats')
  @UseGuards(JwtGuard)
  getMyStats(@GetUser('id') userId: string) {
    return this.usersService.getMyStats(userId);
  }

  @Get('suggestions')
  @UseGuards(JwtGuard)
  getSuggestions(@GetUser('id') userId: string) {
    return this.usersService.getSuggestions(userId);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findById(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.findById(id, userId);
  }

  @Get('admin/metrics')
  @UseGuards(JwtGuard)
  getAdminMetrics(@GetUser('id') userId: string) {
    return this.usersService.getAdminMetrics(userId);
  }
}
