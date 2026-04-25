import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'https://example.com/db';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.REDIS_URL = 'redis://localhost:6379';

const { env } = await import('../config/env.js');

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

const prismaMock = {
  user: createDelegateMock(),
  otpToken: createDelegateMock(),
  passwordResetToken: createDelegateMock(),
  galleryItem: createDelegateMock(),
  comment: createDelegateMock(),
  reaction: createDelegateMock(),
  location: createDelegateMock(),
  unit: createDelegateMock(),
  bookingRequest: createDelegateMock(),
  sellUnitRequest: createDelegateMock(),
  unitOrderRequest: createDelegateMock(),
  finish: createDelegateMock(),
  finishRequest: createDelegateMock(),
  furnitureItem: createDelegateMock(),
  furnitureBooking: createDelegateMock(),
  specialFurnitureRequest: createDelegateMock(),
  favorite: createDelegateMock(),
  whatsappOpenEvent: createDelegateMock(),
  $transaction: vi.fn(async (input: any) => {
    if (typeof input === 'function') {
      return input(prismaMock);
    }
    return Promise.all(input);
  }),
};

const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

vi.mock('../config/database.js', () => ({
  prisma: prismaMock,
}));

vi.mock('../config/redis.js', () => ({
  redis: redisMock,
}));

const { app } = await import('../app.js');

function token(role: 'USER' | 'ADMIN', userId = 'user-1') {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET);
}

function resetMocks() {
  for (const delegate of Object.values(prismaMock)) {
    if (!delegate || typeof delegate !== 'object' || !('findMany' in delegate)) continue;
    delegate.findMany.mockReset();
    delegate.count.mockReset();
    delegate.findUnique.mockReset();
    delegate.findFirst.mockReset();
    delegate.create.mockReset();
    delegate.update.mockReset();
    delegate.updateMany.mockReset();
    delegate.delete.mockReset();
  }
  prismaMock.$transaction.mockClear();
  redisMock.get.mockReset();
  redisMock.set.mockReset();
  redisMock.del.mockReset();
}

beforeEach(() => {
  resetMocks();
});

describe('SRS remediation', () => {
  it('allows admin catalog writes with real enum roles', async () => {
    prismaMock.location.create.mockResolvedValue({
      id: 'loc-1',
      address: 'Cairo',
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await request(app)
      .post('/api/v1/locations')
      .set('Authorization', `Bearer ${token('ADMIN')}`)
      .send({ address: 'Cairo' });

    expect(response.status).toBe(201);
    expect(prismaMock.location.create).toHaveBeenCalledTimes(1);
  });

  it('registers a user and creates an otp token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      isVerified: false,
    });
    prismaMock.otpToken.create.mockResolvedValue({ id: 'otp-1' });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Nada',
        email: 'user@example.com',
        password: 'StrongPass1',
      });

    expect(response.status).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.otpToken.create).toHaveBeenCalledTimes(1);
  });

  it('blocks login for unverified accounts', async () => {
    const password = await bcrypt.hash('StrongPass1', 4);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password,
      role: 'USER',
      isVerified: false,
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'StrongPass1' });

    expect(response.status).toBe(403);
  });

  it('verifies otp and activates the user', async () => {
    prismaMock.otpToken.findFirst.mockResolvedValue({ id: 'otp-1' });
    prismaMock.otpToken.update.mockResolvedValue({ id: 'otp-1', consumed: true });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
    prismaMock.user.update.mockResolvedValue({ id: 'user-1', isVerified: true });

    const response = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ email: 'user@example.com', code: '123456' });

    expect(response.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('returns the authenticated profile from /users/me', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Nada',
      email: 'user@example.com',
      phone: null,
      address: null,
      rate: 0,
      role: 'USER',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token('USER')}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('user@example.com');
  });

  it('rejects change-password when old password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      password: await bcrypt.hash('OldPass1', 4),
    });

    const response = await request(app)
      .post('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${token('USER')}`)
      .send({
        oldPassword: 'wrong',
        newPassword: 'NewStrong1',
        confirmPassword: 'NewStrong1',
      });

    expect(response.status).toBe(401);
  });

  it('rejects privileged booking fields on user create', async () => {
    const response = await request(app)
      .post('/api/v1/bookingRequests')
      .set('Authorization', `Bearer ${token('USER')}`)
      .send({
        unitId: 'unit-1',
        status: 'ACCEPTED',
      });

    expect(response.status).toBe(422);
    expect(prismaMock.bookingRequest.create).not.toHaveBeenCalled();
  });

  it('binds booking request creation to the authenticated user', async () => {
    prismaMock.unit.findUnique.mockResolvedValue({
      id: 'unit-1',
      deletedAt: null,
      availability: 'AVAILABLE',
    });
    prismaMock.bookingRequest.create.mockResolvedValue({
      id: 'booking-1',
      unitId: 'unit-1',
      userId: 'user-1',
      status: 'PENDING',
    });

    const response = await request(app)
      .post('/api/v1/bookingRequests')
      .set('Authorization', `Bearer ${token('USER', 'user-1')}`)
      .send({
        unitId: 'unit-1',
        phone: '0100',
      });

    expect(response.status).toBe(201);
    expect(prismaMock.bookingRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'user-1', unitId: 'unit-1' }),
    }));
  });

  it('lets admins review booking requests through the explicit review endpoint', async () => {
    prismaMock.bookingRequest.findUnique.mockResolvedValue({
      id: 'booking-1',
      status: 'PENDING',
    });
    prismaMock.bookingRequest.update.mockResolvedValue({
      id: 'booking-1',
      status: 'ACCEPTED',
    });

    const response = await request(app)
      .patch('/api/v1/bookingRequests/booking-1/review')
      .set('Authorization', `Bearer ${token('ADMIN')}`)
      .send({ status: 'ACCEPTED', adminNote: 'ok' });

    expect(response.status).toBe(200);
    expect(prismaMock.bookingRequest.update).toHaveBeenCalledTimes(1);
  });

  it('creates a unit when an admin accepts a sell-unit request', async () => {
    prismaMock.sellUnitRequest.findUnique.mockResolvedValue({
      id: 'sell-1',
      status: 'PENDING',
      title: 'Unit',
      description: 'Desc',
      price: 10,
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
    });
    prismaMock.sellUnitRequest.update.mockResolvedValue({
      id: 'sell-1',
      title: 'Unit',
      description: 'Desc',
      price: 10,
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
      status: 'ACCEPTED',
    });
    prismaMock.unit.create.mockResolvedValue({ id: 'unit-1' });

    const response = await request(app)
      .patch('/api/v1/sellUnitRequests/sell-1/review')
      .set('Authorization', `Bearer ${token('ADMIN')}`)
      .send({ status: 'ACCEPTED' });

    expect(response.status).toBe(200);
    expect(prismaMock.unit.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ acceptedSellRequestId: 'sell-1' }),
    }));
  });

  it('blocks comment edits from non-owners', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      userId: 'owner-1',
      body: 'hello',
      galleryItemId: 'gallery-1',
    });

    const response = await request(app)
      .patch('/api/v1/comments/comment-1')
      .set('Authorization', `Bearer ${token('USER', 'user-1')}`)
      .send({ body: 'updated' });

    expect(response.status).toBe(403);
  });

  it('blocks reaction deletes from non-owners', async () => {
    prismaMock.reaction.findUnique.mockResolvedValue({
      id: 'reaction-1',
      userId: 'owner-1',
      type: 'LIKE',
      galleryItemId: 'gallery-1',
    });

    const response = await request(app)
      .delete('/api/v1/reactions/reaction-1')
      .set('Authorization', `Bearer ${token('USER', 'user-1')}`);

    expect(response.status).toBe(403);
  });
});
