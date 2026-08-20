import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:password@example.com:5432/db';
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_PASSWORD = 'password';
process.env.POSTGRES_DB = 'db';
process.env.POSTGRES_HOST = 'example.com';
process.env.POSTGRES_PORT = '5432';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.S3_PUBLIC_BASE_URL = 'https://files.example.com/nada-city-uploads';

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  otpToken: {
    deleteMany: vi.fn(),
  },
  passwordResetToken: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

const revokeRefreshTokensForUserMock = vi.fn();
const blacklistAccessTokenMock = vi.fn();
const isAccessTokenBlacklistedMock = vi.fn();

vi.mock('../../config/database.js', () => ({ prisma: prismaMock }));
vi.mock('../auth/refresh-token.service.js', () => ({
  revokeRefreshTokensForUser: revokeRefreshTokensForUserMock,
}));
vi.mock('../auth/access-token-blacklist.service.js', () => ({
  blacklistAccessToken: blacklistAccessTokenMock,
  isAccessTokenBlacklisted: isAccessTokenBlacklistedMock,
}));

const { env } = await import('../../config/env.js');
const { app } = await import('../../app.js');

function authToken(userId = 'user-1'): string {
  return jwt.sign(
    { sub: userId, role: 'USER', email: `${userId}@example.com` },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  );
}

describe('DELETE /api/v1/me/account', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock));
    prismaMock.otpToken.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.user.delete.mockResolvedValue({ id: 'user-1' });
    revokeRefreshTokensForUserMock.mockResolvedValue(undefined);
    blacklistAccessTokenMock.mockResolvedValue(undefined);
    isAccessTokenBlacklistedMock.mockResolvedValue(false);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user-1@example.com',
      password: await bcrypt.hash('correct-password', 4),
    });
  });

  it('returns 401 without a bearer token', async () => {
    const response = await request(app)
      .delete('/api/v1/me/account')
      .send({ confirmation: 'DELETE' });

    expect(response.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid bearer token', async () => {
    const response = await request(app)
      .delete('/api/v1/me/account')
      .set('Authorization', 'Bearer not-a-jwt')
      .send({ confirmation: 'DELETE' });

    expect(response.status).toBe(401);
  });

  it('returns 401 for a revoked bearer token', async () => {
    isAccessTokenBlacklistedMock.mockResolvedValue(true);

    const response = await request(app)
      .delete('/api/v1/me/account')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ confirmation: 'DELETE' });

    expect(response.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a missing or incorrect final confirmation', async () => {
    const response = await request(app)
      .delete('/api/v1/me/account')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ confirmation: 'delete' });

    expect(response.status).toBe(422);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password before deleting anything', async () => {
    const response = await request(app)
      .delete('/api/v1/me/account')
      .set('Authorization', `Bearer ${authToken()}`)
      .send({ confirmation: 'DELETE', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deletes only the authenticated account and its owned data', async () => {
    const response = await request(app)
      .delete('/api/v1/me/account?userId=user-2')
      .set('Authorization', `Bearer ${authToken('user-1')}`)
      .send({ confirmation: 'DELETE', password: 'correct-password' });

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(revokeRefreshTokensForUserMock).toHaveBeenCalledWith('user-1');
    expect(blacklistAccessTokenMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ sub: 'user-1' }));
    expect(prismaMock.otpToken.deleteMany).toHaveBeenCalledWith({ where: { email: 'user-1@example.com' } });
    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { email: 'user-1@example.com' } });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(prismaMock.user.delete).not.toHaveBeenCalledWith({ where: { id: 'user-2' } });
  });
});
