import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { prisma } from '../../config/database.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { assertStrongPassword } from '../../utils/password.js';
import { getAuthUserId } from '../../utils/auth.js';

const router = Router();

const UpdateMeSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).strict();

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).strict();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: getAuthUserId(req) } });
    if (!user) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'User Not Found',
        status: 404,
        detail: 'Authenticated user was not found.',
      });
    }
    sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      rate: user.rate,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/me', authenticate, validate(UpdateMeSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: getAuthUserId(req) },
      data: req.body as z.infer<typeof UpdateMeSchema>,
    });
    sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      rate: user.rate,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/me/change-password', authenticate, validate(ChangePasswordSchema), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body as z.infer<typeof ChangePasswordSchema>;
    assertStrongPassword(newPassword);
    const user = await prisma.user.findUnique({ where: { id: getAuthUserId(req) } });
    if (!user) {
      throw new ProblemDetail({
        type: 'not-found',
        title: 'User Not Found',
        status: 404,
        detail: 'Authenticated user was not found.',
      });
    }

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      throw new ProblemDetail({
        type: 'unauthorized',
        title: 'Invalid Password',
        status: 401,
        detail: 'Old password is incorrect.',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 12) },
    });
    sendSuccess(res, { changed: true });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
