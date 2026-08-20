import crypto from 'node:crypto';
import type { JwtPayload } from 'jsonwebtoken';
import { redis } from '../../config/redis.js';

const ACCESS_TOKEN_BLACKLIST_KEY_PREFIX = 'access_token_blacklist:';

function keyForAccessToken(token: string): string {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return `${ACCESS_TOKEN_BLACKLIST_KEY_PREFIX}${tokenHash}`;
}

/**
 * Prevent an access token from being used again until its signed expiry.
 * Tokens are hashed before being stored so Redis never holds a usable bearer
 * credential.
 */
export async function blacklistAccessToken(token: string, payload: JwtPayload): Promise<void> {
  if (typeof payload.exp !== 'number') {
    return;
  }

  const remainingSeconds = Math.ceil(payload.exp - Date.now() / 1000);
  if (remainingSeconds <= 0) {
    return;
  }

  await redis.set(keyForAccessToken(token), '1', { EX: remainingSeconds });
}

export async function isAccessTokenBlacklisted(token: string): Promise<boolean> {
  return (await redis.exists(keyForAccessToken(token))) === 1;
}
