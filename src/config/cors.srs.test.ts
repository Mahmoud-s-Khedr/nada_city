import request from 'supertest';
import { describe, expect, it } from 'vitest';
import express from 'express';
import cors from 'cors';
import { parseCorsOrigin } from './cors.js';

function createApp(corsOrigin: string) {
  const app = express();
  const parsed = parseCorsOrigin(corsOrigin);

  app.use(
    cors({
      origin: parsed.origin,
      credentials: parsed.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.post('/api/v1/auth/login', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('parseCorsOrigin', () => {
  it('returns wildcard mode for *', () => {
    const parsed = parseCorsOrigin('*');

    expect(parsed.mode).toBe('wildcard');
    expect(parsed.origin).toBe('*');
    expect(parsed.credentials).toBe(false);
    expect(parsed.allowedCount).toBe(0);
  });

  it('returns single mode for one origin', () => {
    const parsed = parseCorsOrigin('http://localhost:5000');

    expect(parsed.mode).toBe('single');
    expect(parsed.origin).toBe('http://localhost:5000');
    expect(parsed.credentials).toBe(true);
    expect(parsed.allowedCount).toBe(1);
  });

  it('returns multi mode for csv origins with spaces and trailing commas', () => {
    const parsed = parseCorsOrigin(' http://localhost:5000, http://159.65.120.18:5000, ');

    expect(parsed.mode).toBe('multi');
    expect(typeof parsed.origin).toBe('function');
    expect(parsed.credentials).toBe(true);
    expect(parsed.allowedCount).toBe(2);
  });
});

describe('CORS runtime behavior', () => {
  it('sets wildcard ACAO without credentials for wildcard mode', async () => {
    const app = createApp('*');

    const res = await request(app).get('/health').set('Origin', 'http://localhost:5000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('allows single configured origin with credentials', async () => {
    const app = createApp('http://localhost:5000');

    const res = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:5000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('allows each origin in multi mode', async () => {
    const app = createApp('http://localhost:5000,http://159.65.120.18:5000');

    const res = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://159.65.120.18:5000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://159.65.120.18:5000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('rejects unknown origin in multi mode', async () => {
    const app = createApp('http://localhost:5000,http://159.65.120.18:5000');

    const res = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'http://evil.example.com')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
  });
});
