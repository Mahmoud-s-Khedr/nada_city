import type { QueryOptions } from '../../utils/query-builder.js';
import type { BookingRequest } from '@prisma/client';
import type { CreateBookingRequestInput, PatchBookingRequestInput } from './bookingRequest.dto.js';
import { BookingRequestRepository, type BookingRequestKey } from './bookingRequest.repository.js';

/**
 * BookingRequest Service
 * Business logic layer — delegates all database access to BookingRequestRepository.
 */
export class BookingRequestService {
  private repo = new BookingRequestRepository();

  /**
   * Find many bookingRequests with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: BookingRequest[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many bookingRequests with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: BookingRequest[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single bookingRequest by key.
   */
  async findOne(key: BookingRequestKey, include?: Record<string, boolean>): Promise<BookingRequest | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new bookingRequest.
   */
  async create(data: CreateBookingRequestInput): Promise<BookingRequest> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a bookingRequest by key.
   */
  async update(key: BookingRequestKey, data: CreateBookingRequestInput | PatchBookingRequestInput): Promise<BookingRequest> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a bookingRequest by key.
   */
  async delete(key: BookingRequestKey): Promise<void> {
    await this.repo.delete(key);
  }
}
