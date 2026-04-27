import type { QueryOptions } from '../../utils/query-builder.js';
import type { SellUnitRequest } from '@prisma/client';
import type { CreateSellUnitRequestInput, PatchSellUnitRequestInput } from './sellUnitRequest.dto.js';
import { ReviewSellUnitRequestSchema } from './sellUnitRequest.dto.js';
import { SellUnitRequestRepository, type SellUnitRequestKey } from './sellUnitRequest.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';
import { z } from 'zod';

export type ReviewSellUnitRequestInput = z.infer<typeof ReviewSellUnitRequestSchema>;

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

  async findAll(filters: { status?: string; userId?: string }): Promise<SellUnitRequest[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    return prisma.sellUnitRequest.findMany({ where, include: { user: true, acceptedUnit: true }, orderBy: { createdAt: 'desc' } });
  }

  async findByUserId(userId: string): Promise<SellUnitRequest[]> {
    return prisma.sellUnitRequest.findMany({ where: { userId }, include: { acceptedUnit: true }, orderBy: { createdAt: 'desc' } });
  }

  async cancel(key: SellUnitRequestKey): Promise<void> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Sell unit request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending sell unit requests can be cancelled.' });
    }
    await this.repo.update(key, { status: 'CANCELLED' });
  }

  async review(key: SellUnitRequestKey, data: ReviewSellUnitRequestInput): Promise<{ updated: SellUnitRequest; unit?: unknown }> {
    const item = await this.repo.findOne(key);
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Sell unit request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending sell unit requests can be reviewed.' });
    }

    let updateData: Record<string, unknown>;
    if (data.status === 'REJECTED') {
      updateData = { status: data.status, adminNote: data.adminNote };
    } else {
      updateData = {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.locationId !== undefined ? { locationId: data.locationId } : {}),
        ...(data.details !== undefined ? { details: data.details } : {}),
        ...(data.imageUrls !== undefined ? { imageUrls: data.imageUrls } : {}),
        ...(data.videoUrls !== undefined ? { videoUrls: data.videoUrls } : {}),
        status: data.status,
        adminNote: data.adminNote,
      };
    }

    if (data.status === 'ACCEPTED') {
      const locationId = data.locationId ?? item.locationId;
      if (!locationId) {
        throw new ProblemDetail({ type: 'validation-error', title: 'Missing Location', status: 422, detail: 'Accepted sell unit requests require a locationId.' });
      }
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.sellUnitRequest.update({ where: { id: item.id }, data: updateData });
        const unit = await tx.unit.create({
          data: {
            title: updated.title,
            description: updated.description,
            price: updated.price,
            type: updated.type,
            imageUrls: updated.imageUrls,
            videoUrls: updated.videoUrls,
            locationId: String(locationId),
            availability: 'AVAILABLE',
            acceptedSellRequestId: updated.id,
          },
        });
        return { updated, unit };
      });
      return result;
    }

    const updated = await this.repo.update(key, updateData);
    return { updated };
  }
}
