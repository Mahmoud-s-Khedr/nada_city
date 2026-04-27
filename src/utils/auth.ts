import type { Request } from 'express';
import { ProblemDetail } from '../middlewares/error.middleware.js';

export function normalizeRole(role: string | undefined): string | undefined {
  return role?.replace(/^"(.+)"$/, '$1');
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

export function assertOwnership<T extends { userId: string }>(
  item: T,
  req: Request,
  action: string,
): void {
  if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
    throw new ProblemDetail({
      type: 'forbidden',
      title: 'Forbidden',
      status: 403,
      detail: `You can only ${action} your own resources.`,
    });
  }
}
