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
};

vi.mock('../../config/database.js', () => ({
  prisma: prismaMock,
}));

const { app } = await import('../../app.js');

const authToken = jwt.sign(
  { id: 'test-user-id', role: 'ADMIN' },
  env.JWT_SECRET
);
const testId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const modelDelegate = prismaMock.unit;

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
    title: 'test-title-' + testId,
    description: 'test-description-' + testId,
    keywords: 'test-keywords-' + testId,
    price: 1.5,
    availability: 'AVAILABLE',
    type: 'RESIDENTIAL',
    imageUrls: 'test-imageUrls-' + testId,
    videoUrls: 'test-videoUrls-' + testId,
    locationId: 'test-locationId-' + testId,
    acceptedSellRequestId: 'test-acceptedSellRequestId-' + testId,
    deletedAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
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
    location: { create: { address: 'test-address-' + testId, latitude: 1.5, longitude: 1.5, deletedAt: new Date("2024-01-01T00:00:00.000Z").toISOString() } },
  };
}

describe('Unit API', () => {
  const basePath = '/api/v1/units';
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

    it('applies bracket-style filters like filter[locationId]', async () => {
      modelDelegate.findMany.mockResolvedValue([mockRecord()]);
      modelDelegate.count.mockResolvedValue(1);

      const requestBuilder = request(app)
        .get(basePath)
        .query({ 'filter[locationId]': 'loc-123' });
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(200);
      expect(modelDelegate.findMany).toHaveBeenCalledTimes(1);
      const firstCall = modelDelegate.findMany.mock.calls[0]?.[0] as Record<string, any>;
      expect(firstCall.where).toMatchObject({
        deletedAt: null,
        locationId: { contains: 'loc-123', mode: 'insensitive' },
        availability: 'AVAILABLE',
      });
    });

    it('redacts sensitive favorites fields when include=favorites is requested', async () => {
      modelDelegate.findMany.mockResolvedValue([mockRecord({
        favorites: [{
          id: 'fav-1',
          userId: 'user-secret',
          type: 'UNIT',
          galleryItemId: 'gallery-1',
          unitId: 'unit-1',
          finishId: 'finish-1',
          furnitureItemId: 'furniture-1',
          createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
        }],
      })]);
      modelDelegate.count.mockResolvedValue(1);

      const requestBuilder = request(app)
        .get(basePath)
        .query({ include: 'favorites' });
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(200);
      expect(response.body.data?.[0]?.favorites?.[0]).toMatchObject({
        id: 'fav-1',
        type: 'UNIT',
      });
      expect(response.body.data?.[0]?.favorites?.[0]).not.toHaveProperty('userId');
      expect(response.body.data?.[0]?.favorites?.[0]).not.toHaveProperty('galleryItemId');
      expect(response.body.data?.[0]?.favorites?.[0]).not.toHaveProperty('unitId');
      expect(response.body.data?.[0]?.favorites?.[0]).not.toHaveProperty('finishId');
      expect(response.body.data?.[0]?.favorites?.[0]).not.toHaveProperty('furnitureItemId');
    });
  });

  describe('POST ' + basePath, () => {
    it('creates a new unit with mocked Prisma', async () => {
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
      modelDelegate.findFirst.mockResolvedValue(mockRecord(existingKey));

      const requestBuilder = request(app).get(existingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('returns 404 when the mocked record does not exist', async () => {
      modelDelegate.findFirst.mockResolvedValue(null);

      const requestBuilder = request(app).get(missingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(404);
    });
  });

  describe('PUT ' + existingItemPath, () => {
    it('returns 404 when mocked Prisma reports a missing record', async () => {
      modelDelegate.updateMany.mockResolvedValue({ count: 0 });

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
      modelDelegate.updateMany.mockResolvedValue({ count: 0 });

      const requestBuilder = request(app).delete(missingItemPath);
      requestBuilder.set('Authorization', `Bearer ${authToken}`);
      const response = await requestBuilder;

      expect(response.status).toBe(404);
    });
  });
});
