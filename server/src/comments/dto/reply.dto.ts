import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommentMediaDto } from './comment-media.dto';

export class ReplyDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  username: string;

  @IsString()
  userAvatar: string;

  @IsString()
  content: string;

  @IsInt()
  likes: number;

  @IsBoolean()
  isLiked: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => CommentMediaDto)
  media?: CommentMediaDto[];

  @IsString()
  createdAt: string;
}
