import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, Location } from '@prisma/client';

export type LocationKey = {
  id: string;
};

/**
 * Location Repository
 * Low-level data access layer for the Location model.
 * Contains all Prisma queries — no business logic.
 */
export class LocationRepository {
  toWhereUnique(key: LocationKey) {
    return { id: key.id };
  }

  keyDescription(key: LocationKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.LocationInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.LocationInclude = {};
    if (include.units) normalized.units = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findMany(options: QueryOptions): Promise<{ data: Location[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.location.findMany({
        where: options.where,
        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.location.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: LocationKey, include?: Record<string, boolean>): Promise<Location | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.location.findFirst({
      where: { ...this.toWhereUnique(key), deletedAt: null },
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<Location> {
    return await prisma.location.create({ data: data as any });
  }

  async update(key: LocationKey, data: Record<string, unknown>): Promise<Location> {
    try {
      const where = { ...this.toWhereUnique(key), deletedAt: null };
      const updated = await prisma.location.updateMany({ where, data: data as any });
      if (updated.count === 0) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Location with key "${this.keyDescription(key)}" not found.`,
        });
      }
      const record = await prisma.location.findFirst({ where });
      if (!record) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Location with key "${this.keyDescription(key)}" not found.`,
        });
      }
      return record;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Location with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: LocationKey): Promise<void> {
    try {

      const deleted = await prisma.location.updateMany({
        where: { ...this.toWhereUnique(key), deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (deleted.count === 0) {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Location with key "${this.keyDescription(key)}" not found.`,
        });
      }

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Location with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
