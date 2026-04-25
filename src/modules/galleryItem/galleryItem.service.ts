import type { QueryOptions } from '../../utils/query-builder.js';
import type { GalleryItem } from '@prisma/client';
import type { CreateGalleryItemInput, PatchGalleryItemInput } from './galleryItem.dto.js';
import { GalleryItemRepository, type GalleryItemKey } from './galleryItem.repository.js';

/**
 * GalleryItem Service
 * Business logic layer — delegates all database access to GalleryItemRepository.
 */
export class GalleryItemService {
  private repo = new GalleryItemRepository();

  /**
   * Find many galleryItems with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: GalleryItem[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many galleryItems with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: GalleryItem[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single galleryItem by key.
   */
  async findOne(key: GalleryItemKey, include?: Record<string, boolean>): Promise<GalleryItem | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new galleryItem.
   */
  async create(data: CreateGalleryItemInput): Promise<GalleryItem> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a galleryItem by key.
   */
  async update(key: GalleryItemKey, data: CreateGalleryItemInput | PatchGalleryItemInput): Promise<GalleryItem> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a galleryItem by key.
   */
  async delete(key: GalleryItemKey): Promise<void> {
    await this.repo.delete(key);
  }
}
