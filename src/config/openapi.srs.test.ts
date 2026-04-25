import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { buildOpenApiDocument } from './openapi.js';

const mountedPrefixes = [
  '/api/v1/auth',
  '/api/v1/users',
  '/api/v1/galleryItems',
  '/api/v1/comments',
  '/api/v1/reactions',
  '/api/v1/locations',
  '/api/v1/units',
  '/api/v1/bookingRequests',
  '/api/v1/sellUnitRequests',
  '/api/v1/unitOrderRequests',
  '/api/v1/finishes',
  '/api/v1/finishRequests',
  '/api/v1/furnitureItems',
  '/api/v1/furnitureBookings',
  '/api/v1/specialFurnitureRequests',
  '/api/v1/favorites',
  '/api/v1/whatsappOpenEvents',
];

describe('OpenAPI generation', () => {
  it('builds an OpenAPI 3 document with health and module coverage', () => {
    const spec = buildOpenApiDocument();
    const paths = Object.keys(spec.paths ?? {});

    expect(spec.openapi).toBe('3.0.0');
    expect(spec.paths['/health']).toBeDefined();

    for (const prefix of mountedPrefixes) {
      expect(paths.some((path) => path.startsWith(prefix))).toBe(true);
    }
  });

  it('serves generated OpenAPI JSON from /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.paths?.['/health']).toBeDefined();
    expect(res.body.components?.securitySchemes?.bearerAuth).toBeDefined();
  });
});

