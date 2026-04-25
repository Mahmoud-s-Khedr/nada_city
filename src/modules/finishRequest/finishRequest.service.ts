import type { QueryOptions } from '../../utils/query-builder.js';
import type { FinishRequest } from '@prisma/client';
import type { CreateFinishRequestInput, PatchFinishRequestInput } from './finishRequest.dto.js';
import { FinishRequestRepository, type FinishRequestKey } from './finishRequest.repository.js';

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
}
