import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { Prisma, Reaction } from '@prisma/client';

export type ReactionKey = {
  id: string;
};

/**
 * Reaction Repository
 * Low-level data access layer for the Reaction model.
 * Contains all Prisma queries — no business logic.
 */
export class ReactionRepository {
  toWhereUnique(key: ReactionKey) {
    return { id: key.id };
  }

  keyDescription(key: ReactionKey): string {
    return `id=\"${key.id}\"`;
  }

  toInclude(include?: Record<string, boolean>): Prisma.ReactionInclude | undefined {
    if (!include) return undefined;
    const normalized: Prisma.ReactionInclude = {};
    if (include.galleryItem) normalized.galleryItem = true;
    if (include.user) normalized.user = true;
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  async findMany(options: QueryOptions): Promise<{ data: Reaction[]; total: number }> {
    const include = this.toInclude(options.include);
    const [data, total] = await Promise.all([
      prisma.reaction.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        ...(include ? { include } : {}),
      }),

      prisma.reaction.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: ReactionKey, include?: Record<string, boolean>): Promise<Reaction | null> {
    const normalizedInclude = this.toInclude(include);

    return prisma.reaction.findUnique({
      where: this.toWhereUnique(key),
      ...(normalizedInclude ? { include: normalizedInclude } : {}),
    });

  }

  async create(data: Record<string, unknown>): Promise<Reaction> {
    return await prisma.reaction.create({
      data: data as any,
      include: { galleryItem: true, user: true },
    });
  }

  async update(key: ReactionKey, data: Record<string, unknown>): Promise<Reaction> {
    try {
      return await prisma.reaction.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Reaction with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: ReactionKey): Promise<void> {
    try {

      await prisma.reaction.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `Reaction with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
