import type { QueryOptions } from '../../utils/query-builder.js';
import type { Reaction } from '@prisma/client';
import type { CreateReactionInput, PatchReactionInput, UpdateReactionInput } from './reaction.dto.js';
import { ReactionRepository, type ReactionKey } from './reaction.repository.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';

/**
 * Reaction Service
 * Business logic layer — delegates all database access to ReactionRepository.
 */
export class ReactionService {
  private repo = new ReactionRepository();

  /**
   * Find many reactions with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Reaction[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single reaction by key.
   */
  async findOne(key: ReactionKey, include?: Record<string, boolean>): Promise<Reaction | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new reaction.
   */
  async create(data: CreateReactionInput, userId: string): Promise<Reaction> {
    const result = await this.repo.create({
      type: data.type,
      galleryItem: { connect: { id: data.galleryItemId } },
      user: { connect: { id: userId } },
    });
    return result;
  }

  /**
   * Update a reaction by key.
   */
  async update(key: ReactionKey, data: UpdateReactionInput | PatchReactionInput, userId: string, admin = false): Promise<Reaction> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Reaction with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only modify your own reactions.',
      });
    }
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a reaction by key.
   */
  async delete(key: ReactionKey, userId: string, admin = false): Promise<void> {
    const existing = await this.repo.findOne(key);
    if (!existing) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'Not Found',
        status: 404,
        detail: `Reaction with key "${this.repo.keyDescription(key)}" not found.`,
      });
    }
    if (!admin && existing.userId !== userId) {
      throw new ProblemDetail({
        type: 'forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'You can only delete your own reactions.',
      });
    }
    await this.repo.delete(key);
  }
}
