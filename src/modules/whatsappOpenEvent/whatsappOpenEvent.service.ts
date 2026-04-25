import type { QueryOptions } from '../../utils/query-builder.js';
import type { WhatsappOpenEvent } from '@prisma/client';
import type { CreateWhatsappOpenEventInput, PatchWhatsappOpenEventInput } from './whatsappOpenEvent.dto.js';
import { WhatsappOpenEventRepository, type WhatsappOpenEventKey } from './whatsappOpenEvent.repository.js';

/**
 * WhatsappOpenEvent Service
 * Business logic layer — delegates all database access to WhatsappOpenEventRepository.
 */
export class WhatsappOpenEventService {
  private repo = new WhatsappOpenEventRepository();

  /**
   * Find many whatsappOpenEvents with cursor-based pagination.
   */
  async findManyCursor(
    cursor: string | null,
    pageSize: number,
    direction: 'forward' | 'backward' = 'forward',
    options?: { where?: Record<string, unknown>; include?: Record<string, boolean> },
  ): Promise<{ data: WhatsappOpenEvent[]; hasMore: boolean; nextCursor: string | null }> {
    return this.repo.findManyCursor(cursor, pageSize, direction, options);
  }

  /**
   * Find many whatsappOpenEvents with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: WhatsappOpenEvent[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single whatsappOpenEvent by key.
   */
  async findOne(key: WhatsappOpenEventKey, include?: Record<string, boolean>): Promise<WhatsappOpenEvent | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new whatsappOpenEvent.
   */
  async create(data: CreateWhatsappOpenEventInput): Promise<WhatsappOpenEvent> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a whatsappOpenEvent by key.
   */
  async update(key: WhatsappOpenEventKey, data: CreateWhatsappOpenEventInput | PatchWhatsappOpenEventInput): Promise<WhatsappOpenEvent> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a whatsappOpenEvent by key.
   */
  async delete(key: WhatsappOpenEventKey): Promise<void> {
    await this.repo.delete(key);
  }
}
