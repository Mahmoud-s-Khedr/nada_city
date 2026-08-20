import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { prisma } from '../../config/database.js';
import { getAuthUserId } from '../../utils/auth.js';
import { sendNoContent } from '../../utils/response.js';
import { revokeRefreshTokensForUser } from '../auth/refresh-token.service.js';
import { blacklistAccessToken } from '../auth/access-token-blacklist.service.js';

export const DeleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
  password: z.string().min(1).optional(),
  currentPassword: z.string().min(1).optional(),
}).strict().refine((data) => !(data.password && data.currentPassword), {
  message: 'Provide only one password field.',
  path: ['password'],
});

const router = Router();

router.delete(
  '/me/account',
  authenticate,
  validate(DeleteAccountSchema),
  async (req, res, next) => {
    try {
      const userId = getAuthUserId(req);
      const accessToken = req.headers.authorization?.slice('Bearer '.length);
      const { confirmation, password, currentPassword } = req.body as z.infer<typeof DeleteAccountSchema>;

      // Keep this explicit even though Zod validates it, so the destructive
      // action remains guarded if the route is ever called without validate().
      if (confirmation !== 'DELETE') {
        throw new ProblemDetail({
          type: 'confirmation-required',
          title: 'Confirmation Required',
          status: 422,
          detail: 'Type DELETE to permanently delete your account.',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        throw new ProblemDetail({
          type: 'not-found',
          title: 'User Not Found',
          status: 404,
          detail: 'Authenticated user was not found.',
        });
      }

      const suppliedPassword = password ?? currentPassword;
      if (suppliedPassword && !(await bcrypt.compare(suppliedPassword, user.password))) {
        throw new ProblemDetail({
          type: 'unauthorized',
          title: 'Invalid Password',
          status: 401,
          detail: 'The current password is incorrect.',
        });
      }

      // Revoke session credentials before deleting the database row. The
      // account-deletion worker handles storage cleanup separately.
      if (accessToken) {
        await blacklistAccessToken(accessToken, req.user!);
      }
      await revokeRefreshTokensForUser(userId);

      await prisma.$transaction(async (tx) => {
        await tx.otpToken.deleteMany({ where: { email: user.email } });
        await tx.passwordResetToken.deleteMany({ where: { email: user.email } });
        await tx.user.delete({ where: { id: userId } });
      });

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },
);

export { router as accountRoutes };
