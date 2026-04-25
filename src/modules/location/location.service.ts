import type { QueryOptions } from '../../utils/query-builder.js';
import type { Location } from '@prisma/client';
import type { CreateLocationInput, PatchLocationInput } from './location.dto.js';
import { LocationRepository, type LocationKey } from './location.repository.js';

/**
 * Location Service
 * Business logic layer — delegates all database access to LocationRepository.
 */
export class LocationService {
  private repo = new LocationRepository();

  /**
   * Find many locations with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: Location[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single location by key.
   */
  async findOne(key: LocationKey, include?: Record<string, boolean>): Promise<Location | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new location.
   */
  async create(data: CreateLocationInput): Promise<Location> {
    const result = await this.repo.create(data as Record<string, unknown>);
    return result;
  }

  /**
   * Update a location by key.
   */
  async update(key: LocationKey, data: CreateLocationInput | PatchLocationInput): Promise<Location> {
    const result = await this.repo.update(key, data as Record<string, unknown>);
    return result;
  }

  /**
   * Delete a location by key.
   */
  async delete(key: LocationKey): Promise<void> {
    await this.repo.delete(key);
  }
}
