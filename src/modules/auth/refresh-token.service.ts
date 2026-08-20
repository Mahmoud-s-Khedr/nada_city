import { redis } from '../../config/redis.js';

const REFRESH_TOKEN_KEY_PREFIX = 'refresh_token:';

/**
 * Revoke every refresh token currently stored for a user.
 *
 * Refresh tokens are keyed by their random token, so Redis SCAN is used to
 * find the keys whose value is this user id. SCAN avoids blocking Redis while
 * still covering tokens issued before this account-deletion flow existed.
 */
export async function revokeRefreshTokensForUser(userId: string): Promise<void> {
  if (typeof redis.scanIterator !== 'function') {
    return;
  }

  const keysToDelete: string[] = [];
  for await (const key of redis.scanIterator({
    MATCH: `${REFRESH_TOKEN_KEY_PREFIX}*`,
    COUNT: 100,
  })) {
    const tokenKey = String(key);
    if (await redis.get(tokenKey) === userId) {
      keysToDelete.push(tokenKey);
    }
  }

  await Promise.all(keysToDelete.map((key) => redis.del(key)));
}
