import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, User } from '@prisma/client';

export type UserKey = {
  id: string;
};

/**
 * User Repository
 * Low-level data access layer for the User model.
 * Contains all Prisma queries — no business logic.
 */
export class UserRepository {
  toWhereUnique(key: UserKey) {
    return { id: key.id };
  }

  keyDescription(key: UserKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.UserInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.UserInclude = {};
    if (include.comments) normalized.comments = true;
    if (include.reactions) normalized.reactions = true;
    if (include.favorites) normalized.favorites = true;
    if (include.bookings) normalized.bookings = true;
    if (include.sellUnitRequests) normalized.sellUnitRequests = true;
    if (include.unitOrderRequests) normalized.unitOrderRequests = true;
    if (include.finishRequests) normalized.finishRequests = true;
    if (include.furnitureBookings) normalized.furnitureBookings = true;
    if (include.specialFurnitureRequests) normalized.specialFurnitureRequests = true;
    if (include.whatsappOpenEvents) normalized.whatsappOpenEvents = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findMany(options: QueryOptions): Promise<{ data: User[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.user.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.user.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: UserKey, include?: Record<string, boolean>): Promise<User | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.user.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<User> {
    return await prisma.user.create({ data: data as any });
  }

  async update(key: UserKey, data: Record<string, unknown>): Promise<User> {
    try {
      return await prisma.user.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `User with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: UserKey): Promise<void> {
    try {

      await prisma.user.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `User with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
