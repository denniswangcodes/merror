import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/api/auth',
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @GetUser() user: { id: string; email: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(user.id, user.email);
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
