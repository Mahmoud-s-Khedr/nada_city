import { prisma } from '../../config/database.js';
import type { QueryOptions } from '../../utils/query-builder.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import type { OtpToken } from '@prisma/client';

export type OtpTokenKey = {
  id: string;
};

/**
 * OtpToken Repository
 * Low-level data access layer for the OtpToken model.
 * Contains all Prisma queries — no business logic.
 */
export class OtpTokenRepository {
  toWhereUnique(key: OtpTokenKey) {
    return { id: key.id };
  }

  keyDescription(key: OtpTokenKey): string {
    return `id=\"${key.id}\"`;
  }

  async findMany(options: QueryOptions): Promise<{ data: OtpToken[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.otpToken.findMany({

        where: options.where,

        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
      }),

      prisma.otpToken.count({ where: options.where }),

    ]);
    return { data, total };
  }

  async findOne(key: OtpTokenKey, include?: Record<string, boolean>): Promise<OtpToken | null> {

    return prisma.otpToken.findUnique({
      where: this.toWhereUnique(key),
    });

  }

  async create(data: Record<string, unknown>): Promise<OtpToken> {
    return await prisma.otpToken.create({ data: data as any });
  }

  async update(key: OtpTokenKey, data: Record<string, unknown>): Promise<OtpToken> {
    try {
      return await prisma.otpToken.update({ where: this.toWhereUnique(key), data: data as any });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `OtpToken with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }

  async delete(key: OtpTokenKey): Promise<void> {
    try {

      await prisma.otpToken.delete({ where: this.toWhereUnique(key) });

    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2025') {
        throw new ProblemDetail({
          type: 'not-found', title: 'Not Found', status: 404,
          detail: `OtpToken with key "${this.keyDescription(key)}" not found.`,
        });
      }
      throw error;
    }
  }
}
