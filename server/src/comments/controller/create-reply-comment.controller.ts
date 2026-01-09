// comments.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateReplyCommentsService } from '../service/create-reply-comment.service';
import { CreateReplyDto } from '../dto/CreateReply.dto';


@Controller('comments')

export class CreateReplyComment {
  constructor(private readonly commentsService: CreateReplyCommentsService) {}

  @Post(':commentId/replies')
  async createReply(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() createReplyDto: CreateReplyDto,
    @Req() req: any,
  ) {
    if (!createReplyDto.content || createReplyDto.content.trim().length === 0) {
      throw new BadRequestException('Content is required');
    }

    if (createReplyDto.content.length > 2000) {
      throw new BadRequestException('Content must be 2000 characters or less');
    }

    const userId = req.user.id;

    return this.commentsService.createReply({
      commentId,
      userId,
      content: createReplyDto.content.trim(),
    });
  }
}