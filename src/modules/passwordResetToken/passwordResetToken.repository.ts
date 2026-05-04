import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { PasswordResetToken } from '@prisma/client';

export type PasswordResetTokenKey = {
  id: string;
};

/**
 * PasswordResetToken Repository
 * Low-level data access layer for the PasswordResetToken model.
 * Contains all Prisma queries — no business logic.
 */
export class PasswordResetTokenRepository {
  toWhereUnique(key: PasswordResetTokenKey) {
    return { id: key.id };
  }

  keyDescription(key: PasswordResetTokenKey): string {
    return `id=\"${key.id}\"`;
  }

  async findMany(options: QueryOptions): Promise<{ data: PasswordResetToken[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.passwordResetToken.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
      }),

      prisma.passwordResetToken.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: PasswordResetTokenKey, _include?: Record<string, boolean>): Promise<PasswordResetToken | null> {

    return prisma.passwordResetToken.findUnique({
      where: this.toWhereUnique(key),
    });

  }

  async create(data: Record<string, unknown>): Promise<PasswordResetToken> {
    return await prisma.passwordResetToken.create({ data: data as any });
  }

  async update(key: PasswordResetTokenKey, data: Record<string, unknown>): Promise<PasswordResetToken> {
    try {
      return await prisma.passwordResetToken.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `PasswordResetToken with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: PasswordResetTokenKey): Promise<void> {
    try {

      await prisma.passwordResetToken.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `PasswordResetToken with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
