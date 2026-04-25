import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, Comment } from '@prisma/client';

export type CommentKey = {
  id: string;
};

/**
 * Comment Repository
 * Low-level data access layer for the Comment model.
 * Contains all Prisma queries — no business logic.
 */
export class CommentRepository {
  toWhereUnique(key: CommentKey) {
    return { id: key.id };
  }

  keyDescription(key: CommentKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.CommentInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.CommentInclude = {};
    if (include.galleryItem) normalized.galleryItem = true;
    if (include.user) normalized.user = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: Comment[]; hasMore: boolean; nextCursor: string | null }> {
    const include = options?.include ? this.toInclude(options.include) : undefined;
    const take = (direction === 'backward' ? -1 : 1) * (pageSize + 1);
    const findArgs: Record<string, unknown> = {
      take,
      orderBy: { id: direction === 'backward' ? 'desc' : 'asc' },
      ...(options?.where ? { where: options.where } : {}),
      ...(include ? { include } : {}),
    };
    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }
    const results = await prisma.comment.findMany(findArgs as any);
    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = data.length > 0 ? String((data[data.length - 1] as any).id) : null;
    return { data, hasMore, nextCursor };
  }

  async findMany(options: QueryOptions): Promise<{ data: Comment[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.comment.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.comment.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: CommentKey, include?: Record<string, boolean>): Promise<Comment | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.comment.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<Comment> {
    return await prisma.comment.create({
      data: data as any,
      include: { galleryItem: true, user: true },
    });
  }

  async update(key: CommentKey, data: Record<string, unknown>): Promise<Comment> {
    try {
      return await prisma.comment.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Comment with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: CommentKey): Promise<void> {
    try {

      await prisma.comment.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Comment with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
