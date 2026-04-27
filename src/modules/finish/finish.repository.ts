import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, Finish } from '@prisma/client';

export type FinishKey = {
  id: string;
};

/**
 * Finish Repository
 * Low-level data access layer for the Finish model.
 * Contains all Prisma queries — no business logic.
 */
export class FinishRepository {
  toWhereUnique(key: FinishKey) {
    return { id: key.id };
  }

  keyDescription(key: FinishKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.FinishInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.FinishInclude = {};
    if (include.requests) normalized.requests = true;
    if (include.favorites) normalized.favorites = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: Finish[]; hasMore: boolean; nextCursor: string | null }> {
    const include = options?.include ? this.toInclude(options.include) : undefined;
    const take = (direction === 'backward' ? -1 : 1) * (pageSize + 1);
    const findArgs: Record<string, unknown> = {
      take,
      orderBy: { id: direction === 'backward' ? 'desc' : 'asc' },
      where: { ...options?.where, deletedAt: null },
      ...(include ? { include } : {}),
    };
    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }
    const results = await prisma.finish.findMany(findArgs as any);
    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = data.length > 0 ? String((data[data.length - 1] as any).id) : null;
    return { data, hasMore, nextCursor };
  }

  async findMany(options: QueryOptions): Promise<{ data: Finish[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.finish.findMany({
        where: options.where,
        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.finish.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: FinishKey, include?: Record<string, boolean>): Promise<Finish | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.finish.findFirst({
      where: { ...this.toWhereUnique(key), deletedAt: null },
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<Finish> {
    return await prisma.finish.create({ data: data as any });
  }

  async update(key: FinishKey, data: Record<string, unknown>): Promise<Finish> {
    try {
      const where = { ...this.toWhereUnique(key), deletedAt: null };
      const updated = await prisma.finish.updateMany({ where, data: data as any });
      if (updated.count === 0) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Finish with key "${this.keyDescription(key)}" not found.`,
        });
      }
      const record = await prisma.finish.findFirst({ where });
      if (!record) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Finish with key "${this.keyDescription(key)}" not found.`,
        });
      }
      return record;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Finish with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: FinishKey): Promise<void> {
    try {

      const deleted = await prisma.finish.updateMany({
        where: { ...this.toWhereUnique(key), deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (deleted.count === 0) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Finish with key "${this.keyDescription(key)}" not found.`,
        });
      }

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Finish with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
