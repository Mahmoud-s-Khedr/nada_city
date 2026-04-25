import type { QueryOptions } from '../../utils/query-builder.js';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import type { CreateUserInput, PatchUserInput } from './user.dto.js';
import { UserRepository, type UserKey } from './user.repository.js';

/**
 * User Service
 * Business logic layer — delegates all database access to UserRepository.
 */
export class UserService {
  private repo = new UserRepository();

  /**
   * Find many users with pagination, sorting, and filtering.
   */
  async findMany(options: QueryOptions): Promise<{ data: User[]; total: number }> {
    return this.repo.findMany(options);
  }

  /**
   * Find a single user by key.
   */
  async findOne(key: UserKey, include?: Record<string, boolean>): Promise<User | null> {
    return this.repo.findOne(key, include);
  }

  /**
   * Create a new user.
   */
  async create(data: CreateUserInput): Promise<User> {
    const createData: Record<string, unknown> = { ...data };
    if (typeof createData.password === 'string') {
      createData.password = await bcrypt.hash(createData.password as string, 12);
    }
    const result = await this.repo.create(createData);
    return result;
  }

  /**
   * Update a user by key.
   */
  async update(key: UserKey, data: CreateUserInput | PatchUserInput): Promise<User> {
    const updateData: Record<string, unknown> = { ...data };
    if (typeof updateData.password === 'string') {
      updateData.password = await bcrypt.hash(updateData.password as string, 12);
    }
    const result = await this.repo.update(key, updateData);
    return result;
  }

  /**
   * Delete a user by key.
   */
  async delete(key: UserKey): Promise<void> {
    await this.repo.delete(key);
  }
}
