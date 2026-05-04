import { beforeEach, describe, expect, it, vi } from 'vitest';

type PrismaDelegateMock = {
  findMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

function createDelegateMock(): PrismaDelegateMock {
  return {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  };
}

const prismaMock: Record<string, PrismaDelegateMock> = {
  furnitureItem: createDelegateMock(),
};

vi.mock('../../config/database.js', () => ({
  prisma: prismaMock,
}));

const { FurnitureItemRepository } = await import('./furnitureItem.repository.js');

const delegate = prismaMock.furnitureItem;

describe('FurnitureItemRepository', () => {
  let repo: InstanceType<typeof FurnitureItemRepository>;

  beforeEach(() => {
    repo = new FurnitureItemRepository();
    vi.clearAllMocks();
  });

  describe('toWhereUnique', () => {
    it('builds where clause from key', () => {
      const key = { id: 'test-id' };
      const where = repo.toWhereUnique(key);
      expect(where).toEqual({ id: key.id });
    });
  });

  describe('keyDescription', () => {
    it('returns a human-readable key description', () => {
      const key = { id: 'test-id' };
      const desc = repo.keyDescription(key);
      expect(typeof desc).toBe('string');
      expect(desc).toContain('id');
    });
  });

  describe('toInclude', () => {
    it('returns undefined when no include provided', () => {
      expect(repo.toInclude(undefined)).toBeUndefined();
    });

    it('normalizes valid include fields', () => {
      const include = { bookings: true };
      const result = repo.toInclude(include);
      expect(result).toEqual({ bookings: true });
    });

    it('ignores unknown fields', () => {
      const include = { nonExistent: true };
      const result = repo.toInclude(include as Record<string, boolean>);
      expect(result).toBeUndefined();
    });
  });

  describe('findMany', () => {
    it('returns data and total count', async () => {
      const mockItems = [{ id: '1' }, { id: '2' }];
      delegate.findMany.mockResolvedValue(mockItems);
      delegate.count.mockResolvedValue(2);

      const options = { where: {}, orderBy: {}, skip: 0, take: 20 };
      const result = await repo.findMany(options);

      expect(result).toEqual({ data: mockItems, total: 2 });
      expect(delegate.findMany).toHaveBeenCalledOnce();
      expect(delegate.count).toHaveBeenCalledOnce();
    });

    it('adds deletedAt: null filter for soft-delete', async () => {
      delegate.findMany.mockResolvedValue([]);
      delegate.count.mockResolvedValue(0);

      const options = { where: {}, orderBy: {}, skip: 0, take: 10 };
      await repo.findMany(options);

      expect(delegate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) }),
      );
      expect(delegate.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) }),
      );
    });
  });

  describe('findOne', () => {
    const key = { id: 'test-id' };

    it('returns the found record', async () => {
      const mockRecord = { id: '1', ...key };
      delegate.findFirst.mockResolvedValue(mockRecord);

      const result = await repo.findOne(key);

      expect(result).toEqual(mockRecord);
      expect(delegate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) }),
      );
    });

    it('returns null when record not found', async () => {
      delegate.findFirst.mockResolvedValue(null);

      const result = await repo.findOne(key);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns a new record', async () => {
      const data = { title: 'test-title', description: 'test-description', price: 1.5 };
      const mockCreated = { id: '1', ...data };
      delegate.create.mockResolvedValue(mockCreated);

      const result = await repo.create(data);

      expect(result).toEqual(mockCreated);
      expect(delegate.create).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    const key = { id: 'test-id' };

    it('updates and returns the record', async () => {
      const data = { title: 'test-title' };
      delegate.updateMany.mockResolvedValue({ count: 1 });
      delegate.findFirst.mockResolvedValue({ id: '1', ...key, ...data });

      const result = await repo.update(key, data);

      expect(result).toBeDefined();
      expect(delegate.updateMany).toHaveBeenCalledOnce();
    });

    it('throws ProblemDetail with status 404 on P2025 error', async () => {
      delegate.updateMany.mockResolvedValue({ count: 0 });

      await expect(repo.update(key, {})).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('delete', () => {
    const key = { id: 'test-id' };

    it('deletes the record', async () => {
      delegate.updateMany.mockResolvedValue({ count: 1 });

      await expect(repo.delete(key)).resolves.toBeUndefined();
      expect(delegate.updateMany).toHaveBeenCalledOnce();
    });

    it('throws ProblemDetail with status 404 on P2025 error', async () => {
      delegate.updateMany.mockResolvedValue({ count: 0 });

      await expect(repo.delete(key)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('findManyCursor', () => {
    it('returns data, hasMore, and nextCursor', async () => {
      const mockItems = [
        { id: 'cursor-1' },
        { id: 'cursor-2' },
      ];
      delegate.findMany.mockResolvedValue(mockItems);

      const result = await repo.findManyCursor(null, 10);

      expect(result.data).toEqual(mockItems);
      expect(result.hasMore).toBe(false);
      expect(delegate.findMany).toHaveBeenCalledOnce();
    });

    it('detects hasMore when results exceed pageSize', async () => {
      const mockItems = Array.from({ length: 3 }, (_, i) => ({
        id: `cursor-${i}`,
      }));
      delegate.findMany.mockResolvedValue(mockItems);

      const result = await repo.findManyCursor(null, 2);

      expect(result.hasMore).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('passes cursor and skip when cursor is provided', async () => {
      delegate.findMany.mockResolvedValue([]);

      await repo.findManyCursor('some-cursor', 10);

      expect(delegate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: 'some-cursor' },
          skip: 1,
        }),
      );
    });
  });

});
