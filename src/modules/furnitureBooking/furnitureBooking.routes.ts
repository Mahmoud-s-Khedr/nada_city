import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateFurnitureBookingPublicSchema, ReviewFurnitureBookingSchema } from './furnitureBooking.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
      ...(typeof req.query.furnitureItemId === 'string' ? { furnitureItemId: req.query.furnitureItemId } : {}),
    };
    const data = await prisma.furnitureBooking.findMany({ where, include: { user: true, furnitureItem: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.furnitureBooking.findMany({
      where: { userId: getAuthUserId(req) },
      include: { furnitureItem: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.furnitureBooking.findUnique({ where: { id: String(req.params.id) }, include: { user: true, furnitureItem: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Furniture booking not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own furniture bookings.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateFurnitureBookingPublicSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateFurnitureBookingPublicSchema>;
    const furnitureItem = await prisma.furnitureItem.findUnique({ where: { id: body.furnitureItemId } });
    if (!furnitureItem || furnitureItem.deletedAt) {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Furniture Item', status: 422, detail: 'Furniture booking requires an existing furniture item.' });
    }
    const created = await prisma.furnitureBooking.create({
      data: {
        ...body,
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
    const item = await prisma.furnitureBooking.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Furniture booking not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own furniture bookings.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending furniture bookings can be cancelled.' });
    }
    await prisma.furnitureBooking.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewFurnitureBookingSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewFurnitureBookingSchema>;
    const item = await prisma.furnitureBooking.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Furniture booking not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending furniture bookings can be reviewed.' });
    }
    const updated = await prisma.furnitureBooking.update({
      where: { id: item.id },
      data: { status: body.status, adminNote: body.adminNote },
    });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as furnitureBookingRoutes };
