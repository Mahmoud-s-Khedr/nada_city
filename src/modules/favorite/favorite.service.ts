import type { QueryOptions } from '../../utils/query-builder.js';
import type { Favorite } from '@prisma/client';
import type { CreateFavoriteInput, PatchFavoriteInput } from './favorite.dto.js';
import { FavoriteRepository, type FavoriteKey } from './favorite.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';

/**
 * Favorite Service
 * Business logic layer — delegates all database access to FavoriteRepository.
 */
export class FavoriteService {
  private repo = new FavoriteRepository();

  private normalizeWriteData(data: CreateFavoriteInput | PatchFavoriteInput, userId?: string): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    if (userId) {
      normalized.user = { connect: { id: userId } };
    }
    if (data.type !== undefined) {
      normalized.type = data.type;
    }
    if (data.galleryItemId !== undefined) {
      normalized.galleryItem = data.galleryItemId ? { connect: { id: data.galleryItemId } } : { disconnect: true };
    }
    if (data.unitId !== undefined) {
      normalized.unit = data.unitId ? { connect: { id: data.unitId } } : { disconnect: true };
    }
    if (data.finishId !== undefined) {
      normalized.finish = data.finishId ? { connect: { id: data.finishId } } : { disconnect: true };
    }
    if (data.furnitureItemId !== undefined) {
      normalized.furnitureItem = data.furnitureItemId
        ? { connect: { id: data.furnitureItemId } }
        : { disconnect: true };
    }

    return normalized;
  }

  /**
   * Find many favorites with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Favorite[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single favorite by key.
   */
  async findOne(key: FavoriteKey, include?: Record<string, boolean>): Promise<Favorite | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new favorite.
   */
  async create(data: CreateFavoriteInput, userId: string): Promise<Favorite> {
    const result = await this.repo.create(this.normalizeWriteData(data, userId));
    return result;
  }

  /**
   * Update a favorite by key.
   */
  async update(key: FavoriteKey, data: CreateFavoriteInput | PatchFavoriteInput, userId: string, admin = false): Promise<Favorite> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Favorite with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only modify your own favorites.',
      });
    }
    const result = await this.repo.update(key, this.normalizeWriteData(data));
    return result;
  }

  /**
   * Delete a favorite by key.
   */
  async delete(key: FavoriteKey, userId: string, admin = false): Promise<void> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Favorite with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only delete your own favorites.',
      });
    }
    await this.repo.delete(key);
  }
}
