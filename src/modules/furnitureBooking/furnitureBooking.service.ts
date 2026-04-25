import type { QueryOptions } from '../../utils/query-builder.js';
import type { FurnitureBooking } from '@prisma/client';
import type { CreateFurnitureBookingInput, PatchFurnitureBookingInput } from './furnitureBooking.dto.js';
import { FurnitureBookingRepository, type FurnitureBookingKey } from './furnitureBooking.repository.js';

/**
 * FurnitureBooking Service
 * Business logic layer — delegates all database access to FurnitureBookingRepository.
 */
export class FurnitureBookingService {
  private repo = new FurnitureBookingRepository();

  /**
   * Find many furnitureBookings with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: FurnitureBooking[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many furnitureBookings with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: FurnitureBooking[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single furnitureBooking by key.
   */
  async findOne(key: FurnitureBookingKey, include?: Record<string, boolean>): Promise<FurnitureBooking | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new furnitureBooking.
   */
  async create(data: CreateFurnitureBookingInput): Promise<FurnitureBooking> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a furnitureBooking by key.
   */
  async update(key: FurnitureBookingKey, data: CreateFurnitureBookingInput | PatchFurnitureBookingInput): Promise<FurnitureBooking> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a furnitureBooking by key.
   */
  async delete(key: FurnitureBookingKey): Promise<void> {
    await this.repo.delete(key);
  }
}
