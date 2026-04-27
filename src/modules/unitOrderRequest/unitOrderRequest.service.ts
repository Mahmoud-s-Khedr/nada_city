import type { QueryOptions } from '../../utils/query-builder.js';
import type { UnitOrderRequest } from '@prisma/client';
import type { CreateUnitOrderRequestInput, PatchUnitOrderRequestInput } from './unitOrderRequest.dto.js';
import { ReviewUnitOrderRequestSchema } from './unitOrderRequest.dto.js';
import { UnitOrderRequestRepository, type UnitOrderRequestKey } from './unitOrderRequest.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';
import { z } from 'zod';

export type ReviewUnitOrderRequestInput = z.infer<typeof ReviewUnitOrderRequestSchema>;

/**
 * UnitOrderRequest Service
 * Business logic layer — delegates all database access to UnitOrderRequestRepository.
 */
export class UnitOrderRequestService {
  private repo = new UnitOrderRequestRepository();

  /**
   * Find many unitOrderRequests with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: UnitOrderRequest[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many unitOrderRequests with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: UnitOrderRequest[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single unitOrderRequest by key.
   */
  async findOne(key: UnitOrderRequestKey, include?: Record<string, boolean>): Promise<UnitOrderRequest | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new unitOrderRequest.
   */
  async create(data: CreateUnitOrderRequestInput): Promise<UnitOrderRequest> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a unitOrderRequest by key.
   */
  async update(key: UnitOrderRequestKey, data: CreateUnitOrderRequestInput | PatchUnitOrderRequestInput): Promise<UnitOrderRequest> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a unitOrderRequest by key.
   */
  async delete(key: UnitOrderRequestKey): Promise<void> {
    await this.repo.delete(key);
  }

  /**
   * Find all unitOrderRequests with optional filters (admin list).
   */
  async findAll(filters: { status?: string; userId?: string }): Promise<UnitOrderRequest[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    return prisma.unitOrderRequest.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Find unitOrderRequests for a specific user.
   */
  async findByUserId(userId: string): Promise<UnitOrderRequest[]> {
    return prisma.unitOrderRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Cancel a pending unitOrderRequest.
   */
  async cancel(key: UnitOrderRequestKey): Promise<void> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({
        type: 'not-found', title: 'Not Found', status: 404,
        detail: 'Unit order request not found.',
      });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({
        type: 'validation-error', title: 'Invalid Status', status: 422,
        detail: 'Only pending unit order requests can be cancelled.',
      });
    }
    await this.repo.update(key, { status: 'CANCELLED' });
  }

  /**
   * Review a pending unitOrderRequest (accept or reject).
   */
  async review(key: UnitOrderRequestKey, data: ReviewUnitOrderRequestInput): Promise<UnitOrderRequest> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({
        type: 'not-found', title: 'Not Found', status: 404,
        detail: 'Unit order request not found.',
      });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({
        type: 'validation-error', title: 'Invalid Status', status: 422,
        detail: 'Only pending unit order requests can be reviewed.',
      });
    }
    return this.repo.update(key, { status: data.status, adminNote: data.adminNote });
  }
}
