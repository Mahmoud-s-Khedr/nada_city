import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { errorMiddleware } from './error.middleware.js';

function createMockRes() {
  const payload: { statusCode?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      payload.statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload.body = body;
      return this;
    },
  };
  return { res, payload };
}

describe('errorMiddleware prisma mapping', () => {
  it('maps prisma auth failure (P1000) to 503', () => {
    const { res, payload } = createMockRes();
    const req = { originalUrl: '/api/v1/auth/login', method: 'POST' } as any;
    const err = new Prisma.PrismaClientInitializationError(
      'Authentication failed against the database server',
      'test-client',
      'P1000'
    );

    errorMiddleware(err, req, res as any, () => undefined);

    expect(payload.statusCode).toBe(503);
    expect(payload.body).toMatchObject({
      type: 'database-auth-failed',
      title: 'Database Authentication Failed',
      status: 503,
    });
  });

  it('keeps existing Prisma known request mapping (P2002 => 409)', () => {
    const { res, payload } = createMockRes();
    const req = { originalUrl: '/api/v1/users', method: 'POST' } as any;
    const err = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: 'test-client',
        meta: { target: ['email'] },
      }
    );

    errorMiddleware(err, req, res as any, () => undefined);

    expect(payload.statusCode).toBe(409);
    expect(payload.body).toMatchObject({
      type: 'unique-constraint',
      title: 'Unique Constraint Violation',
      status: 409,
    });
  });
});
