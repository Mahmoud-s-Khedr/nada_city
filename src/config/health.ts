import { prisma } from './database.js';
import { redis } from './redis.js';

export type DependencyStatus = {
  db: 'up' | 'down';
  redis: 'up' | 'down';
};

export async function getDependencyStatus(): Promise<DependencyStatus> {
  const status: DependencyStatus = { db: 'down', redis: 'down' };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.db = 'up';
  } catch {
    status.db = 'down';
  }

  try {
    const pong = await redis.ping();
    status.redis = pong === 'PONG' ? 'up' : 'down';
  } catch {
    status.redis = 'down';
  }

  return status;
}

export function isReady(status: DependencyStatus): boolean {
  return status.db === 'up' && status.redis === 'up';
}
