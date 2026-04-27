import type { QueryOptions } from '../../utils/query-builder.js';
import type { BookingRequest } from '@prisma/client';
import type { CreateBookingRequestInput, PatchBookingRequestInput } from './bookingRequest.dto.js';
import { ReviewBookingRequestSchema } from './bookingRequest.dto.js';
import { BookingRequestRepository, type BookingRequestKey } from './bookingRequest.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';
import { z } from 'zod';

export type ReviewBookingRequestInput = z.infer<typeof ReviewBookingRequestSchema>;

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

  async findAll(filters: { status?: string; userId?: string; unitId?: string }): Promise<BookingRequest[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.unitId) where.unitId = filters.unitId;
    return prisma.bookingRequest.findMany({ where, include: { unit: true, user: true }, orderBy: { createdAt: 'desc' } });
  }

  async findByUserId(userId: string): Promise<BookingRequest[]> {
    return prisma.bookingRequest.findMany({ where: { userId }, include: { unit: true }, orderBy: { createdAt: 'desc' } });
  }

  async createBooking(body: z.infer<typeof import('./bookingRequest.dto.js').CreateBookingRequestPublicSchema>, userId: string): Promise<BookingRequest> {
    return prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({ where: { id: body.unitId } });
      if (!unit || unit.deletedAt || unit.availability !== 'AVAILABLE') {
        throw new ProblemDetail({
          type: 'validation-error', title: 'Invalid Unit', status: 422,
          detail: 'Booking requires an available existing unit.',
        });
      }
      return tx.bookingRequest.create({
        data: {
          unitId: body.unitId,
          userId,
          name: body.name,
          phone: body.phone,
          address: body.address,
          details: body.details,
        },
      });
    });
  }

  async cancel(key: BookingRequestKey): Promise<void> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending booking requests can be cancelled.' });
    }
    await this.repo.update(key, { status: 'CANCELLED' });
  }

  async review(key: BookingRequestKey, data: ReviewBookingRequestInput): Promise<BookingRequest> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending booking requests can be reviewed.' });
    }
    return this.repo.update(key, { status: data.status, adminNote: data.adminNote });
  }
}
