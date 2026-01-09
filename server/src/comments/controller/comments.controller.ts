import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentDto } from '../dto/comment.dto';
import { CommentsService } from '../service/comments.service';


@Controller('comments')
export class CommentsController {

    constructor(
           private commentService: CommentsService
       ) { }


  @Get(':movieId')
  async getMovieComments(
    @Param('movieId') movieId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {    
    return this.commentService.getCommentsByMovie({movieId, limit, page : offset});
  }


  
}
