import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

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
};

vi.mock('../../config/database.js', () => ({
  prisma: prismaMock,
}));

const { app } = await import('../../app.js');

const authToken = jwt.sign(
  { id: 'test-user-id', role: '"USER"' },
  env.JWT_SECRET
);
const testId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const modelDelegate = prismaMock.sellUnitRequest;

beforeEach(() => {
  for (const delegate of Object.values(prismaMock)) {
    delegate.findMany.mockReset();
    delegate.count.mockReset();
    delegate.findUnique.mockReset();
    delegate.findFirst.mockReset();
    delegate.create.mockReset();
    delegate.update.mockReset();
    delegate.updateMany.mockReset();
    delegate.delete.mockReset();
  }
});

function mockRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-id-' + testId,
    userId: 'test-userId-' + testId,
    title: 'test-title-' + testId,
    description: 'test-description-' + testId,
    price: 1.5,
    type: 'RESIDENTIAL',
    address: 'test-address-' + testId,
    locationId: 'test-locationId-' + testId,
    details: 'test-details-' + testId,
    imageUrls: 'test-imageUrls-' + testId,
    videoUrls: 'test-videoUrls-' + testId,
    status: 'PENDING',
    adminNote: 'test-adminNote-' + testId,
    createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    updatedAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    ...overrides,
  };
}

function validPayload() {
  return {
    title: 'test-title-' + testId,
    description: 'test-description-' + testId,
    price: 1.5,
    type: 'RESIDENTIAL',
    address: 'test-address-' + testId,
    user: { create: { name: 'test-name-' + testId, email: 'test-email-' + testId, password: 'test-password-' + testId, phone: 'test-phone-' + testId, address: 'test-address-' + testId, rate: 1.5, role: 'USER', isVerified: true } },
  };
}

describe('SellUnitRequest API', () => {
  const basePath = '/api/v1/sellUnitRequests';
  const existingKey = {
    id: 'existing-id',
  };
  const missingKey = {
    id: 'missing-id',
  };
  function buildItemPath(key: typeof existingKey): string {
    return basePath + '/:id'
      .replace(':id', encodeURIComponent(String(key.id)))
    ;
  }
  const existingItemPath = buildItemPath(existingKey);
  const missingItemPath = buildItemPath(missingKey);

  describe('GET ' + basePath, () => {
    it('returns a paginated list from mocked Prisma delegates', async () => {
      modelDelegate.findMany.mockResolvedValue([mockRecord()]);
      modelDelegate.count.mockResolvedValue(1);

      const requestBuilder = request(app).get(basePath).query({ page: 1, limit: 10 });
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toMatchObject({ page: 1, limit: 10, total: 1, totalPages: 1 });
      expect(modelDelegate.findMany).toHaveBeenCalledTimes(1);
      expect(modelDelegate.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST ' + basePath, () => {
    it('creates a new sellUnitRequest with mocked Prisma', async () => {
      modelDelegate.create.mockResolvedValue(mockRecord());

      const requestBuilder = request(app)
        .post(basePath)
        .send(validPayload())
        .set('Content-Type', 'application/json');
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(modelDelegate.create).toHaveBeenCalledTimes(1);
    });

    it('returns 422 for an invalid body before hitting Prisma', async () => {
      const requestBuilder = request(app)
        .post(basePath)
        .send({})
        .set('Content-Type', 'application/json');
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(422);
      expect(modelDelegate.create).not.toHaveBeenCalled();
    });
  });

  describe('GET ' + existingItemPath, () => {
    it('returns a single record from mocked Prisma', async () => {
      modelDelegate.findUnique.mockResolvedValue(mockRecord(existingKey));

      const requestBuilder = request(app).get(existingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('returns 404 when the mocked record does not exist', async () => {
      modelDelegate.findUnique.mockResolvedValue(null);

      const requestBuilder = request(app).get(missingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(404);
    });
  });

  describe('PUT ' + existingItemPath, () => {
    it('returns 404 when mocked Prisma reports a missing record', async () => {
      modelDelegate.update.mockRejectedValue({ code: 'P2025' });

      const requestBuilder = request(app)
        .put(missingItemPath)
        .send(validPayload())
        .set('Content-Type', 'application/json');
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE ' + existingItemPath, () => {
    it('returns 404 when mocked Prisma reports a missing record', async () => {
      modelDelegate.delete.mockRejectedValue({ code: 'P2025' });

      const requestBuilder = request(app).delete(missingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(404);
    });
  });
});
