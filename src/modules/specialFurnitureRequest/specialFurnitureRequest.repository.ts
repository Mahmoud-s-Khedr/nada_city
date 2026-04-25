import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, SpecialFurnitureRequest } from '@prisma/client';

export type SpecialFurnitureRequestKey = {
  id: string;
};

/**
 * SpecialFurnitureRequest Repository
 * Low-level data access layer for the SpecialFurnitureRequest model.
 * Contains all Prisma queries — no business logic.
 */
export class SpecialFurnitureRequestRepository {
  toWhereUnique(key: SpecialFurnitureRequestKey) {
    return { id: key.id };
  }

  keyDescription(key: SpecialFurnitureRequestKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.SpecialFurnitureRequestInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.SpecialFurnitureRequestInclude = {};
    if (include.user) normalized.user = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: SpecialFurnitureRequest[]; hasMore: boolean; nextCursor: string | null }> {
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
    const results = await prisma.specialFurnitureRequest.findMany(findArgs as any);
    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, pageSize) : results;
    const nextCursor = data.length > 0 ? String((data[data.length - 1] as any).id) : null;
    return { data, hasMore, nextCursor };
  }

  async findMany(options: QueryOptions): Promise<{ data: SpecialFurnitureRequest[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.specialFurnitureRequest.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.specialFurnitureRequest.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: SpecialFurnitureRequestKey, include?: Record<string, boolean>): Promise<SpecialFurnitureRequest | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.specialFurnitureRequest.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<SpecialFurnitureRequest> {
    return await prisma.specialFurnitureRequest.create({
      data: data as any,
      include: { user: true },
    });
  }

  async update(key: SpecialFurnitureRequestKey, data: Record<string, unknown>): Promise<SpecialFurnitureRequest> {
    try {
      return await prisma.specialFurnitureRequest.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `SpecialFurnitureRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: SpecialFurnitureRequestKey): Promise<void> {
    try {

      await prisma.specialFurnitureRequest.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `SpecialFurnitureRequest with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
