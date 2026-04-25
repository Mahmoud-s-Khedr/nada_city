import type { QueryOptions } from '../../utils/query-builder.js';
import type { Comment } from '@prisma/client';
import type { CreateCommentInput, PatchCommentInput, UpdateCommentInput } from './comment.dto.js';
import { CommentRepository, type CommentKey } from './comment.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';

/**
 * Comment Service
 * Business logic layer — delegates all database access to CommentRepository.
 */
export class CommentService {
  private repo = new CommentRepository();

  /**
   * Find many comments with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: Comment[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many comments with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Comment[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single comment by key.
   */
  async findOne(key: CommentKey, include?: Record<string, boolean>): Promise<Comment | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new comment.
   */
  async create(data: CreateCommentInput, userId: string): Promise<Comment> {
    const result = await this.repo.create({
      body: data.body,
      galleryItem: { connect: { id: data.galleryItemId } },
      user: { connect: { id: userId } },
    });
    return result;
  }

  /**
   * Update a comment by key.
   */
  async update(key: CommentKey, data: UpdateCommentInput | PatchCommentInput, userId: string, admin = false): Promise<Comment> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Comment with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only modify your own comments.',
      });
    }
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a comment by key.
   */
  async delete(key: CommentKey, userId: string, admin = false): Promise<void> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Comment with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only delete your own comments.',
      });
    }
    await this.repo.delete(key);
  }
}
