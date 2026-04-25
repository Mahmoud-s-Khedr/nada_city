import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, SellUnitRequest } from '@prisma/client';

export type SellUnitRequestKey = {
  id: string;
};

/**
 * SellUnitRequest Repository
 * Low-level data access layer for the SellUnitRequest model.
 * Contains all Prisma queries — no business logic.
 */
export class SellUnitRequestRepository {
  toWhereUnique(key: SellUnitRequestKey) {
    return { id: key.id };
  }

  keyDescription(key: SellUnitRequestKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.SellUnitRequestInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.SellUnitRequestInclude = {};
    if (include.user) normalized.user = true;
    if (include.acceptedUnit) normalized.acceptedUnit = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: SellUnitRequest[]; hasMore: boolean; nextCursor: string | null }> {
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
    const results = await prisma.sellUnitRequest.findMany(findArgs as any);
    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = data.length > 0 ? String((data[data.length - 1] as any).id) : null;
    return { data, hasMore, nextCursor };
  }

  async findMany(options: QueryOptions): Promise<{ data: SellUnitRequest[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.sellUnitRequest.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.sellUnitRequest.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: SellUnitRequestKey, include?: Record<string, boolean>): Promise<SellUnitRequest | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.sellUnitRequest.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<SellUnitRequest> {
    return await prisma.sellUnitRequest.create({
      data: data as any,
      include: { user: true },
    });
  }

  async update(key: SellUnitRequestKey, data: Record<string, unknown>): Promise<SellUnitRequest> {
    try {
      return await prisma.sellUnitRequest.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `SellUnitRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: SellUnitRequestKey): Promise<void> {
    try {

      await prisma.sellUnitRequest.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `SellUnitRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
