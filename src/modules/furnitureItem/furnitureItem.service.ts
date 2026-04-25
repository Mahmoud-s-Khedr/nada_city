import type { QueryOptions } from '../../utils/query-builder.js';
import type { FurnitureItem } from '@prisma/client';
import type { CreateFurnitureItemInput, PatchFurnitureItemInput } from './furnitureItem.dto.js';
import { FurnitureItemRepository, type FurnitureItemKey } from './furnitureItem.repository.js';

/**
 * FurnitureItem Service
 * Business logic layer — delegates all database access to FurnitureItemRepository.
 */
export class FurnitureItemService {
  private repo = new FurnitureItemRepository();

  /**
   * Find many furnitureItems with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: FurnitureItem[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many furnitureItems with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: FurnitureItem[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single furnitureItem by key.
   */
  async findOne(key: FurnitureItemKey, include?: Record<string, boolean>): Promise<FurnitureItem | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new furnitureItem.
   */
  async create(data: CreateFurnitureItemInput): Promise<FurnitureItem> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a furnitureItem by key.
   */
  async update(key: FurnitureItemKey, data: CreateFurnitureItemInput | PatchFurnitureItemInput): Promise<FurnitureItem> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a furnitureItem by key.
   */
  async delete(key: FurnitureItemKey): Promise<void> {
    await this.repo.delete(key);
  }
}
