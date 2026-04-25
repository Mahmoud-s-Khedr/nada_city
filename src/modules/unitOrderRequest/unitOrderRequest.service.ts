import type { QueryOptions } from '../../utils/query-builder.js';
import type { UnitOrderRequest } from '@prisma/client';
import type { CreateUnitOrderRequestInput, PatchUnitOrderRequestInput } from './unitOrderRequest.dto.js';
import { UnitOrderRequestRepository, type UnitOrderRequestKey } from './unitOrderRequest.repository.js';

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
}
