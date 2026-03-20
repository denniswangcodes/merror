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
  search(@Query('q') q: string) {
    return this.usersService.search(q ?? '');
  }

  @Get('qr/:qrCode')
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.usersService.findByQrCode(qrCode);
  }

  @Get('by-username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
