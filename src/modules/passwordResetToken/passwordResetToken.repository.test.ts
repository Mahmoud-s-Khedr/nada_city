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
  passwordResetToken: createDelegateMock(),
};

vi.mock('../../config/database.js', () => ({
  prisma: prismaMock,
}));

const { PasswordResetTokenRepository } = await import('./passwordResetToken.repository.js');

const delegate = prismaMock.passwordResetToken;

describe('PasswordResetTokenRepository', () => {
  let repo: InstanceType<typeof PasswordResetTokenRepository>;

  beforeEach(() => {
    repo = new PasswordResetTokenRepository();
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

  });

  describe('findOne', () => {
    const key = { id: 'test-id' };

    it('returns the found record', async () => {
      const mockRecord = { id: '1', ...key };
      delegate.findUnique.mockResolvedValue(mockRecord);

      const result = await repo.findOne(key);

      expect(result).toEqual(mockRecord);
      expect(delegate.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: repo.toWhereUnique(key) }),
      );
    });

    it('returns null when record not found', async () => {
      delegate.findUnique.mockResolvedValue(null);

      const result = await repo.findOne(key);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns a new record', async () => {
      const data = { email: 'test-email', token: 'test-token', consumed: true };
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
      const data = { email: 'test-email' };
      delegate.update.mockResolvedValue({ id: '1', ...key, ...data });

      const result = await repo.update(key, data);

      expect(result).toBeDefined();
      expect(delegate.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: repo.toWhereUnique(key) }),
      );
    });

    it('throws ProblemDetail with status 404 on P2025 error', async () => {
      const prismaError = Object.assign(new Error('Record not found'), { code: 'P2025' });
      delegate.update.mockRejectedValue(prismaError);

      await expect(repo.update(key, {})).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('delete', () => {
    const key = { id: 'test-id' };

    it('deletes the record', async () => {
      delegate.delete.mockResolvedValue({ id: '1' });

      await expect(repo.delete(key)).resolves.toBeUndefined();
      expect(delegate.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: repo.toWhereUnique(key) }),
      );
    });

    it('throws ProblemDetail with status 404 on P2025 error', async () => {
      const prismaError = Object.assign(new Error('Record not found'), { code: 'P2025' });
      delegate.delete.mockRejectedValue(prismaError);

      await expect(repo.delete(key)).rejects.toMatchObject({ status: 404 });
    });
  });

});
