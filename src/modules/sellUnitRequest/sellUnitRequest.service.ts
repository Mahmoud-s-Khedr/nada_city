import type { QueryOptions } from '../../utils/query-builder.js';
import type { SellUnitRequest } from '@prisma/client';
import type { CreateSellUnitRequestInput, PatchSellUnitRequestInput } from './sellUnitRequest.dto.js';
import { SellUnitRequestRepository, type SellUnitRequestKey } from './sellUnitRequest.repository.js';

/**
 * SellUnitRequest Service
 * Business logic layer — delegates all database access to SellUnitRequestRepository.
 */
export class SellUnitRequestService {
  private repo = new SellUnitRequestRepository();

  /**
   * Find many sellUnitRequests with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: SellUnitRequest[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many sellUnitRequests with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: SellUnitRequest[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single sellUnitRequest by key.
   */
  async findOne(key: SellUnitRequestKey, include?: Record<string, boolean>): Promise<SellUnitRequest | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new sellUnitRequest.
   */
  async create(data: CreateSellUnitRequestInput): Promise<SellUnitRequest> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a sellUnitRequest by key.
   */
  async update(key: SellUnitRequestKey, data: CreateSellUnitRequestInput | PatchSellUnitRequestInput): Promise<SellUnitRequest> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a sellUnitRequest by key.
   */
  async delete(key: SellUnitRequestKey): Promise<void> {
    await this.repo.delete(key);
  }
}
