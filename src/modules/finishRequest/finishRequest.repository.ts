import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, FinishRequest } from '@prisma/client';

export type FinishRequestKey = {
  id: string;
};

/**
 * FinishRequest Repository
 * Low-level data access layer for the FinishRequest model.
 * Contains all Prisma queries — no business logic.
 */
export class FinishRequestRepository {
  toWhereUnique(key: FinishRequestKey) {
    return { id: key.id };
  }

  keyDescription(key: FinishRequestKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.FinishRequestInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.FinishRequestInclude = {};
    if (include.user) normalized.user = true;
    if (include.finish) normalized.finish = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: FinishRequest[]; hasMore: boolean; nextCursor: string | null }> {
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
    const results = await prisma.finishRequest.findMany(findArgs as any);
    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = data.length > 0 ? String((data[data.length - 1] as any).id) : null;
    return { data, hasMore, nextCursor };
  }

  async findMany(options: QueryOptions): Promise<{ data: FinishRequest[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.finishRequest.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.finishRequest.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: FinishRequestKey, include?: Record<string, boolean>): Promise<FinishRequest | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.finishRequest.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<FinishRequest> {
    return await prisma.finishRequest.create({
      data: data as any,
      include: { user: true, finish: true },
    });
  }

  async update(key: FinishRequestKey, data: Record<string, unknown>): Promise<FinishRequest> {
    try {
      return await prisma.finishRequest.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `FinishRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: FinishRequestKey): Promise<void> {
    try {

      await prisma.finishRequest.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `FinishRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
