import type { Request } from 'express';
import { ProblemDetail } from '../middlewares/error.middleware.js';

export function normalizeRole(role: string | undefined): string | undefined {
  return role?.replaceAll('"', '');
}

export function getAuthUserId(req: Request): string {
  const userId = (req.user?.sub ?? req.user?.id) as string | undefined;
  if (!userId) {
    throw new ProblemDetail({
      type: 'unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authenticated user id is missing from the token.',
      instance: req.originalUrl,
    });
  }
  return userId;
}

export function getAuthUserRole(req: Request): string | undefined {
  return normalizeRole(req.user?.role as string | undefined);
}

export function isAdmin(req: Request): boolean {
  return getAuthUserRole(req) === 'ADMIN';
}
