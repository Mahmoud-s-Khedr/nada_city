import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateFinishRequestPublicSchema, ReviewFinishRequestSchema } from './finishRequest.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
      ...(typeof req.query.finishId === 'string' ? { finishId: req.query.finishId } : {}),
    };
    const data = await prisma.finishRequest.findMany({ where, include: { user: true, finish: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.finishRequest.findMany({
      where: { userId: getAuthUserId(req) },
      include: { finish: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.finishRequest.findUnique({ where: { id: String(req.params.id) }, include: { user: true, finish: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Finish request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own finish requests.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateFinishRequestPublicSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateFinishRequestPublicSchema>;
    if (body.finishId) {
      const finish = await prisma.finish.findUnique({ where: { id: body.finishId } });
      if (!finish || finish.deletedAt) {
        throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Finish', status: 422, detail: 'Finish request requires an existing finish when finishId is provided.' });
      }
    }
    const created = await prisma.finishRequest.create({
      data: {
        ...body,
        requestedAt: new Date(body.requestedAt),
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
    const item = await prisma.finishRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Finish request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own finish requests.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending finish requests can be cancelled.' });
    }
    await prisma.finishRequest.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewFinishRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewFinishRequestSchema>;
    const item = await prisma.finishRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Finish request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending finish requests can be reviewed.' });
    }
    const updated = await prisma.finishRequest.update({
      where: { id: item.id },
      data: { status: body.status, adminNote: body.adminNote },
    });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as finishRequestRoutes };
