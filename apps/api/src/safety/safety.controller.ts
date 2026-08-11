import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateReportDto, ReviewReportDto } from './dto/safety.dto';
import { SafetyService } from './safety.service';

@Controller('safety')
@UseGuards(JwtGuard)
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post('reports')
  report(@GetUser('id') userId: string, @Body() dto: CreateReportDto) { return this.safety.createReport(userId, dto); }

  @Get('reports')
  reports(@GetUser('id') userId: string) { return this.safety.getReports(userId); }

  @Patch('reports/:id')
  review(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: ReviewReportDto) { return this.safety.reviewReport(userId, id, dto); }

  @Post('blocks/:userId')
  block(@GetUser('id') userId: string, @Param('userId') blockedId: string) { return this.safety.block(userId, blockedId); }

  @Delete('blocks/:userId')
  unblock(@GetUser('id') userId: string, @Param('userId') blockedId: string) { return this.safety.unblock(userId, blockedId); }

  @Get('blocks')
  blocks(@GetUser('id') userId: string) { return this.safety.getBlocked(userId); }
}
