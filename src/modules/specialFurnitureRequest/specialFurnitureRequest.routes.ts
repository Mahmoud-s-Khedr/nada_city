import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateSpecialFurnitureRequestPublicSchema, ReviewSpecialFurnitureRequestSchema } from './specialFurnitureRequest.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
    };
    const data = await prisma.specialFurnitureRequest.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.specialFurnitureRequest.findMany({
      where: { userId: getAuthUserId(req) },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.specialFurnitureRequest.findUnique({ where: { id: String(req.params.id) }, include: { user: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Special furniture request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own special furniture requests.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateSpecialFurnitureRequestPublicSchema), async (req, res, next) => {
  try {
    const created = await prisma.specialFurnitureRequest.create({
      data: {
        ...(req.body as z.infer<typeof CreateSpecialFurnitureRequestPublicSchema>),
        userId: getAuthUserId(req),
      },
    });
    sendCreated(res, created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.specialFurnitureRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Special furniture request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own special furniture requests.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending special furniture requests can be cancelled.' });
    }
    await prisma.specialFurnitureRequest.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewSpecialFurnitureRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewSpecialFurnitureRequestSchema>;
    const item = await prisma.specialFurnitureRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Special furniture request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending special furniture requests can be reviewed.' });
    }
    const updated = await prisma.specialFurnitureRequest.update({
      where: { id: item.id },
      data: { status: body.status, adminNote: body.adminNote },
    });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as specialFurnitureRequestRoutes };
