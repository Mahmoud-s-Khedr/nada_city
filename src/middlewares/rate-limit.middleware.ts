import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const rateLimiter = env.NODE_ENV === 'development'
  ? (_req: Request, _res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        type: 'rate-limit-exceeded',
        title: 'Too Many Requests',
        status: 429,
        detail: 'You have exceeded the rate limit. Please try again later.',
      },
    });

/**
 * Create a per-route rate limiter with custom limits.
 * Use for sensitive or expensive endpoints via @bcm.rateLimit directive.
 */
export function createRouteRateLimit(_max: number, _windowMs: number) {
  if (env.NODE_ENV === 'development') {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return rateLimit({
    windowMs: _windowMs,
    max: _max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      type: 'rate-limit-exceeded',
      title: 'Too Many Requests',
      status: 429,
      detail: 'You have exceeded the rate limit. Please try again later.',
    },
  });
}
