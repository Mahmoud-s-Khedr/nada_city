import type { QueryOptions } from '../../utils/query-builder.js';
import type { PasswordResetToken } from '@prisma/client';
import type { CreatePasswordResetTokenInput, PatchPasswordResetTokenInput } from './passwordResetToken.dto.js';
import { PasswordResetTokenRepository, type PasswordResetTokenKey } from './passwordResetToken.repository.js';

/**
 * PasswordResetToken Service
 * Business logic layer — delegates all database access to PasswordResetTokenRepository.
 */
export class PasswordResetTokenService {
  private repo = new PasswordResetTokenRepository();

  /**
   * Find many passwordResetTokens with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: PasswordResetToken[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single passwordResetToken by key.
   */
  async findOne(key: PasswordResetTokenKey, include?: Record<string, boolean>): Promise<PasswordResetToken | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new passwordResetToken.
   */
  async create(data: CreatePasswordResetTokenInput): Promise<PasswordResetToken> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a passwordResetToken by key.
   */
  async update(key: PasswordResetTokenKey, data: CreatePasswordResetTokenInput | PatchPasswordResetTokenInput): Promise<PasswordResetToken> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a passwordResetToken by key.
   */
  async delete(key: PasswordResetTokenKey): Promise<void> {
    await this.repo.delete(key);
  }
}
