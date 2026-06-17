import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./health.js', () => ({
  getDependencyStatus: vi.fn(),
  isReady: vi.fn(),
}));

const { app } = await import('../app.js');
const { getDependencyStatus, isReady } = await import('./health.js');

describe('health routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns liveness without dependency checks', async () => {
    const res = await request(app).get('/live');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.uptime).toBe('number');
    expect(getDependencyStatus).not.toHaveBeenCalled();
  });

  it('returns readiness payload when dependencies are available', async () => {
    vi.mocked(getDependencyStatus).mockResolvedValue({ db: 'up', redis: 'up' });
    vi.mocked(isReady).mockReturnValue(true);

    const res = await request(app).get('/ready');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      ready: true,
      dependencies: { db: 'up', redis: 'up' },
    });
  });

  it('keeps /health as a readiness alias', async () => {
    vi.mocked(getDependencyStatus).mockResolvedValue({ db: 'down', redis: 'up' });
    vi.mocked(isReady).mockReturnValue(false);

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({
      status: 'degraded',
      ready: false,
      dependencies: { db: 'down', redis: 'up' },
    });
  });
});
