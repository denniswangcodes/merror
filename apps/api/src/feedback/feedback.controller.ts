import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Optional,
  Param,
  Patch,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@GetUser('id') giverId: string, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(giverId, dto);
  }

  @Get('feed')
  getFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.feedbackService.getFeed(page, Math.min(limit, 50));
  }

  @Get('received')
  @UseGuards(JwtGuard)
  getReceived(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.feedbackService.getReceived(userId, page, Math.min(limit, 50));
  }

  @Get('given')
  @UseGuards(JwtGuard)
  getGiven(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.feedbackService.getGiven(userId, page, Math.min(limit, 50));
  }

  @Patch(':id/approve')
  @UseGuards(JwtGuard)
  approve(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.review(userId, id, true);
  }

  @Patch(':id/reject')
  @UseGuards(JwtGuard)
  reject(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.review(userId, id, false);
  }
}
