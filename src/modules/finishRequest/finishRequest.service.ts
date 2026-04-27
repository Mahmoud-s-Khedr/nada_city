import type { QueryOptions } from '../../utils/query-builder.js';
import type { FinishRequest } from '@prisma/client';
import type { CreateFinishRequestInput, PatchFinishRequestInput } from './finishRequest.dto.js';
import { ReviewFinishRequestSchema } from './finishRequest.dto.js';
import { FinishRequestRepository, type FinishRequestKey } from './finishRequest.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';
import { z } from 'zod';

export type ReviewFinishRequestInput = z.infer<typeof ReviewFinishRequestSchema>;

/**
 * FinishRequest Service
 * Business logic layer — delegates all database access to FinishRequestRepository.
 */
export class FinishRequestService {
  private repo = new FinishRequestRepository();

  /**
   * Find many finishRequests with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: FinishRequest[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many finishRequests with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: FinishRequest[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single finishRequest by key.
   */
  async findOne(key: FinishRequestKey, include?: Record<string, boolean>): Promise<FinishRequest | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new finishRequest.
   */
  async create(data: CreateFinishRequestInput): Promise<FinishRequest> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a finishRequest by key.
   */
  async update(key: FinishRequestKey, data: CreateFinishRequestInput | PatchFinishRequestInput): Promise<FinishRequest> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a finishRequest by key.
   */
  async delete(key: FinishRequestKey): Promise<void> {
    await this.repo.delete(key);
  }

  async findAll(filters: { status?: string; userId?: string; finishId?: string }): Promise<FinishRequest[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.finishId) where.finishId = filters.finishId;
    return prisma.finishRequest.findMany({ where, include: { user: true, finish: true }, orderBy: { createdAt: 'desc' } });
  }

  async findByUserId(userId: string): Promise<FinishRequest[]> {
    return prisma.finishRequest.findMany({ where: { userId }, include: { finish: true }, orderBy: { createdAt: 'desc' } });
  }

  async cancel(key: FinishRequestKey): Promise<void> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Finish request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending finish requests can be cancelled.' });
    }
    await this.repo.update(key, { status: 'CANCELLED' });
  }

  async review(key: FinishRequestKey, data: ReviewFinishRequestInput): Promise<FinishRequest> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Finish request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending finish requests can be reviewed.' });
    }
    return this.repo.update(key, { status: data.status, adminNote: data.adminNote });
  }
}
