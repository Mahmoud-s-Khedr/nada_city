import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, Favorite } from '@prisma/client';

export type FavoriteKey = {
  id: string;
};

/**
 * Favorite Repository
 * Low-level data access layer for the Favorite model.
 * Contains all Prisma queries — no business logic.
 */
export class FavoriteRepository {
  toWhereUnique(key: FavoriteKey) {
    return { id: key.id };
  }

  keyDescription(key: FavoriteKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.FavoriteInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.FavoriteInclude = {};
    if (include.user) normalized.user = true;
    if (include.galleryItem) normalized.galleryItem = true;
    if (include.unit) normalized.unit = true;
    if (include.finish) normalized.finish = true;
    if (include.furnitureItem) normalized.furnitureItem = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findMany(options: QueryOptions): Promise<{ data: Favorite[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.favorite.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.favorite.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: FavoriteKey, include?: Record<string, boolean>): Promise<Favorite | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.favorite.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<Favorite> {
    return await prisma.favorite.create({
      data: data as any,
      include: { user: true },
    });
  }

  async update(key: FavoriteKey, data: Record<string, unknown>): Promise<Favorite> {
    try {
      return await prisma.favorite.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Favorite with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: FavoriteKey): Promise<void> {
    try {

      await prisma.favorite.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Favorite with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
