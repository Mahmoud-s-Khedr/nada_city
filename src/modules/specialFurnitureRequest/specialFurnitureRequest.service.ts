import type { QueryOptions } from '../../utils/query-builder.js';
import type { SpecialFurnitureRequest } from '@prisma/client';
import type { CreateSpecialFurnitureRequestInput, PatchSpecialFurnitureRequestInput } from './specialFurnitureRequest.dto.js';
import { SpecialFurnitureRequestRepository, type SpecialFurnitureRequestKey } from './specialFurnitureRequest.repository.js';

/**
 * SpecialFurnitureRequest Service
 * Business logic layer — delegates all database access to SpecialFurnitureRequestRepository.
 */
export class SpecialFurnitureRequestService {
  private repo = new SpecialFurnitureRequestRepository();

  /**
   * Find many specialFurnitureRequests with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: SpecialFurnitureRequest[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many specialFurnitureRequests with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: SpecialFurnitureRequest[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single specialFurnitureRequest by key.
   */
  async findOne(key: SpecialFurnitureRequestKey, include?: Record<string, boolean>): Promise<SpecialFurnitureRequest | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new specialFurnitureRequest.
   */
  async create(data: CreateSpecialFurnitureRequestInput): Promise<SpecialFurnitureRequest> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a specialFurnitureRequest by key.
   */
  async update(key: SpecialFurnitureRequestKey, data: CreateSpecialFurnitureRequestInput | PatchSpecialFurnitureRequestInput): Promise<SpecialFurnitureRequest> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a specialFurnitureRequest by key.
   */
  async delete(key: SpecialFurnitureRequestKey): Promise<void> {
    await this.repo.delete(key);
  }
}
