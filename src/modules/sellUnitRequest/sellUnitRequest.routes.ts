import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateSellUnitRequestPublicSchema, ReviewSellUnitRequestSchema } from './sellUnitRequest.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
    };
    const data = await prisma.sellUnitRequest.findMany({ where, include: { user: true, acceptedUnit: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.sellUnitRequest.findMany({
      where: { userId: getAuthUserId(req) },
      include: { acceptedUnit: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.sellUnitRequest.findUnique({ where: { id: String(req.params.id) }, include: { user: true, acceptedUnit: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Sell unit request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own sell unit requests.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateSellUnitRequestPublicSchema), async (req, res, next) => {
  try {
    const created = await prisma.sellUnitRequest.create({
      data: {
        ...(req.body as z.infer<typeof CreateSellUnitRequestPublicSchema>),
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
    const item = await prisma.sellUnitRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Sell unit request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own sell unit requests.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending sell unit requests can be cancelled.' });
    }
    await prisma.sellUnitRequest.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewSellUnitRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewSellUnitRequestSchema>;
    const item = await prisma.sellUnitRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Sell unit request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending sell unit requests can be reviewed.' });
    }

    const updateData = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.locationId !== undefined ? { locationId: body.locationId } : {}),
      ...(body.details !== undefined ? { details: body.details } : {}),
      ...(body.imageUrls !== undefined ? { imageUrls: body.imageUrls } : {}),
      ...(body.videoUrls !== undefined ? { videoUrls: body.videoUrls } : {}),
      status: body.status,
      adminNote: body.adminNote,
    };

    if (body.status === 'ACCEPTED') {
      const locationId = body.locationId ?? item.locationId;
      if (!locationId) {
        throw new ProblemDetail({ type: 'validation-error', title: 'Missing Location', status: 422, detail: 'Accepted sell unit requests require a locationId.' });
      }
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.sellUnitRequest.update({ where: { id: item.id }, data: updateData });
        const unit = await tx.unit.create({
          data: {
            title: updated.title,
            description: updated.description,
            price: updated.price,
            type: updated.type,
            imageUrls: updated.imageUrls,
            videoUrls: updated.videoUrls,
            locationId,
            availability: 'AVAILABLE',
            acceptedSellRequestId: updated.id,
          },
        });
        return { updated, unit };
      });
      sendSuccess(res, result);
      return;
    }

    const updated = await prisma.sellUnitRequest.update({ where: { id: item.id }, data: updateData });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as sellUnitRequestRoutes };
