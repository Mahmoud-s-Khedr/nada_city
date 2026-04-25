import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateUnitOrderRequestPublicSchema, ReviewUnitOrderRequestSchema } from './unitOrderRequest.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
    };
    const data = await prisma.unitOrderRequest.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.unitOrderRequest.findMany({
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
    const item = await prisma.unitOrderRequest.findUnique({ where: { id: String(req.params.id) }, include: { user: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Unit order request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own unit order requests.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateUnitOrderRequestPublicSchema), async (req, res, next) => {
  try {
    const created = await prisma.unitOrderRequest.create({
      data: {
        ...(req.body as z.infer<typeof CreateUnitOrderRequestPublicSchema>),
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
    const item = await prisma.unitOrderRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Unit order request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own unit order requests.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending unit order requests can be cancelled.' });
    }
    await prisma.unitOrderRequest.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewUnitOrderRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewUnitOrderRequestSchema>;
    const item = await prisma.unitOrderRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Unit order request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending unit order requests can be reviewed.' });
    }
    const updated = await prisma.unitOrderRequest.update({
      where: { id: item.id },
      data: { status: body.status, adminNote: body.adminNote },
    });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as unitOrderRequestRoutes };
