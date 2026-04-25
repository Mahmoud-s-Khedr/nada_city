import type { QueryOptions } from '../../utils/query-builder.js';
import type { Unit } from '@prisma/client';
import type { CreateUnitInput, PatchUnitInput } from './unit.dto.js';
import { UnitRepository, type UnitKey } from './unit.repository.js';

/**
 * Unit Service
 * Business logic layer — delegates all database access to UnitRepository.
 */
export class UnitService {
  private repo = new UnitRepository();

  /**
   * Find many units with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: Unit[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many units with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Unit[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single unit by key.
   */
  async findOne(key: UnitKey, include?: Record<string, boolean>): Promise<Unit | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new unit.
   */
  async create(data: CreateUnitInput): Promise<Unit> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a unit by key.
   */
  async update(key: UnitKey, data: CreateUnitInput | PatchUnitInput): Promise<Unit> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a unit by key.
   */
  async delete(key: UnitKey): Promise<void> {
    await this.repo.delete(key);
  }
}
