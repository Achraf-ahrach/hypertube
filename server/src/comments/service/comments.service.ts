

// comments.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { eq, desc, isNull, inArray, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module'; // your drizzle db instance
import { comments, users, commentLikes } from '../../database/schema'; // your schema
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

interface PaginationParams {
  page: number;
  limit: number;
  movieId: number;
  currentUserId?: number; // for checking if user liked comments
}

export interface CommentWithUser {
  id: number;
  userId: number;
  username: string | null;
  userAvatar: string | null;
  content: string;
  likes: number;
  isLiked: boolean;
  replies?: CommentWithUser[];
  replyCount: number;
  createdAt: string;
}

@Injectable()
export class CommentsService {


 constructor(
        @Inject(DRIZZLE) private readonly db: ReturnType<typeof drizzle>,
    ) { }

  async getCommentsByMovie(params: PaginationParams) {
    const { page, limit, movieId, currentUserId } = params;
    const offset = (page - 1) * limit;

    const topLevelComments = await this.db
      .select({
        id: comments.id,
        userId: comments.userId,
        username: users.username,
        userAvatar: users.avatarUrl,
        content: comments.content,
        createdAt: comments.createdAt,
        likes: sql<number>`COALESCE(COUNT(DISTINCT ${commentLikes.id}), 0)`.as('likes'),
        isLiked: currentUserId
          ? sql<boolean>`EXISTS(
              SELECT 1 FROM comment_likes 
              WHERE comment_id = ${comments.id} 
              AND user_id = ${currentUserId}
            )`.as('isLiked')
          : sql<boolean>`false`.as('isLiked'),
        replyCount: sql<number>`(
          SELECT COUNT(*) 
          FROM comments AS replies 
          WHERE replies.parent_id = ${comments.id}
        )`.as('replyCount'),
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(commentLikes, eq(comments.id, commentLikes.commentId))
      .where(
        sql`${comments.movieId} = ${movieId} AND ${comments.parentId} IS NULL`
      )
      .groupBy(comments.id, users.id)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    if (topLevelComments.length === 0) {
      return {
        comments: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const commentIds = topLevelComments.map((c) => c.id);
    
    const replies = await this.db
      .select({
        id: comments.id,
        parentId: comments.parentId,
        userId: comments.userId,
        username: users.username,
        userAvatar: users.avatarUrl,
        content: comments.content,
        createdAt: comments.createdAt,
        likes: sql<number>`COALESCE(COUNT(DISTINCT ${commentLikes.id}), 0)`.as('likes'),
        isLiked: currentUserId
          ? sql<boolean>`EXISTS(
              SELECT 1 FROM comment_likes 
              WHERE comment_id = ${comments.id} 
              AND user_id = ${currentUserId}
            )`.as('isLiked')
          : sql<boolean>`false`.as('isLiked'),
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(commentLikes, eq(comments.id, commentLikes.commentId))
      .where(inArray(comments.parentId, commentIds))
      .groupBy(comments.id, users.id, comments.parentId)
      .orderBy(desc(comments.createdAt));

    // Step 3: Map replies to their parent comments
    const commentsMap = new Map<number, CommentWithUser>();
    
    topLevelComments.forEach((comment) => {
      commentsMap.set(comment.id, {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        replies: [],
        isLiked: Boolean(comment.isLiked),
      });
    });

    replies.forEach((reply) => {
      const parentComment = commentsMap.get(reply.parentId!);
      if (parentComment) {
        parentComment.replies!.push({
          id: reply.id,
          userId: reply.userId,
          username: reply.username,
          userAvatar: reply.userAvatar,
          content: reply.content,
          likes: reply.likes,
          isLiked: Boolean(reply.isLiked),
          createdAt: reply.createdAt.toISOString(),
          replyCount: 0,
        });
      }
    });

    const totalResult = await this.db
      .select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(comments)
      .where(
        sql`${comments.movieId} = ${movieId} AND ${comments.parentId} IS NULL`
      );

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      comments: Array.from(commentsMap.values()),
      total,
      page,
      limit,
      totalPages,
    };
  }
}