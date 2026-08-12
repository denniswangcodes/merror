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
  Delete,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
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
  @UseGuards(JwtGuard)
  getFeed(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.feedbackService.getFeed(userId, page, Math.min(limit, 50));
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

  // Public single-reflection lookup, for shareable links — only returns public + approved reflections.
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.feedbackService.getById(id);
  }

  @Get(':id/like')
  @UseGuards(JwtGuard)
  getLikeStatus(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.getLikeStatus(userId, id);
  }

  @Post(':id/like')
  @UseGuards(JwtGuard)
  toggleLike(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.toggleLike(userId, id);
  }

  // Comments are publicly readable (same content-first model as the reflection itself); posting requires auth.
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.feedbackService.getComments(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  addComment(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.feedbackService.addComment(userId, id, dto.message);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtGuard)
  removeComment(@GetUser('id') userId: string, @Param('commentId') commentId: string) {
    return this.feedbackService.removeComment(userId, commentId);
  }

  // Photo-only edit — only the giver who posted the reflection can replace or remove its image.
  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.updateImage(userId, id, dto.imageUrl);
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

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.remove(userId, id);
  }
}
