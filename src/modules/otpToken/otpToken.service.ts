import type { QueryOptions } from '../../utils/query-builder.js';
import type { OtpToken } from '@prisma/client';
import type { CreateOtpTokenInput, PatchOtpTokenInput } from './otpToken.dto.js';
import { OtpTokenRepository, type OtpTokenKey } from './otpToken.repository.js';

/**
 * OtpToken Service
 * Business logic layer — delegates all database access to OtpTokenRepository.
 */
export class OtpTokenService {
  private repo = new OtpTokenRepository();

  /**
   * Find many otpTokens with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: OtpToken[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single otpToken by key.
   */
  async findOne(key: OtpTokenKey, include?: Record<string, boolean>): Promise<OtpToken | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new otpToken.
   */
  async create(data: CreateOtpTokenInput): Promise<OtpToken> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a otpToken by key.
   */
  async update(key: OtpTokenKey, data: CreateOtpTokenInput | PatchOtpTokenInput): Promise<OtpToken> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a otpToken by key.
   */
  async delete(key: OtpTokenKey): Promise<void> {
    await this.repo.delete(key);
  }
}
