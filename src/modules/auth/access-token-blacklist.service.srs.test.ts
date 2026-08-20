import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const redisMock = {
  exists: vi.fn(),
  set: vi.fn(),
};

vi.mock('../../config/redis.js', () => ({ redis: redisMock }));

const { blacklistAccessToken, isAccessTokenBlacklisted } = await import('./access-token-blacklist.service.js');

describe('access-token blacklist', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T12:00:00Z'));
    vi.clearAllMocks();
    redisMock.set.mockResolvedValue('OK');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores only a token hash until the JWT expires', async () => {
    const token = 'sensitive-bearer-token';
    await blacklistAccessToken(token, { exp: 1_787_227_300 });

    expect(redisMock.set).toHaveBeenCalledWith(
      expect.stringMatching(/^access_token_blacklist:[a-f0-9]{64}$/),
      '1',
      { EX: 100 },
    );
    expect(redisMock.set.mock.calls[0][0]).not.toContain(token);
  });

  it('uses the same hash to look up a revoked token', async () => {
    redisMock.exists.mockResolvedValue(1);

    await expect(isAccessTokenBlacklisted('sensitive-bearer-token')).resolves.toBe(true);
    expect(redisMock.exists).toHaveBeenCalledWith(expect.stringMatching(/^access_token_blacklist:[a-f0-9]{64}$/));
  });
});
