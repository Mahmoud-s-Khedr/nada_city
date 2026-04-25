import type { QueryOptions } from '../../utils/query-builder.js';
import type { Finish } from '@prisma/client';
import type { CreateFinishInput, PatchFinishInput } from './finish.dto.js';
import { FinishRepository, type FinishKey } from './finish.repository.js';

/**
 * Finish Service
 * Business logic layer — delegates all database access to FinishRepository.
 */
export class FinishService {
  private repo = new FinishRepository();

  /**
   * Find many finishes with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: Finish[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many finishes with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Finish[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single finish by key.
   */
  async findOne(key: FinishKey, include?: Record<string, boolean>): Promise<Finish | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new finish.
   */
  async create(data: CreateFinishInput): Promise<Finish> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a finish by key.
   */
  async update(key: FinishKey, data: CreateFinishInput | PatchFinishInput): Promise<Finish> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a finish by key.
   */
  async delete(key: FinishKey): Promise<void> {
    await this.repo.delete(key);
  }
}
