import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { prisma } from '../../config/database.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, isAdmin } from '../../utils/auth.js';
import { CreateBookingRequestPublicSchema, ReviewBookingRequestSchema } from './bookingRequest.dto.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const where: any = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
      ...(typeof req.query.unitId === 'string' ? { unitId: req.query.unitId } : {}),
    };
    const data = await prisma.bookingRequest.findMany({ where, include: { unit: true, user: true }, orderBy: { createdAt: 'desc' } });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await prisma.bookingRequest.findMany({
      where: { userId: getAuthUserId(req) },
      include: { unit: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.bookingRequest.findUnique({ where: { id: String(req.params.id) }, include: { unit: true, user: true } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only view your own booking requests.' });
    }
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateBookingRequestPublicSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateBookingRequestPublicSchema>;
    const unit = await prisma.unit.findUnique({ where: { id: body.unitId } });
    if (!unit || unit.deletedAt || unit.availability !== 'AVAILABLE') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Unit', status: 422, detail: 'Booking requires an available existing unit.' });
    }
    const created = await prisma.bookingRequest.create({
      data: {
        unitId: body.unitId,
        userId: getAuthUserId(req),
        name: body.name,
        phone: body.phone,
        address: body.address,
        details: body.details,
      },
    });
    sendCreated(res, created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await prisma.bookingRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    if (!isAdmin(req) && item.userId !== getAuthUserId(req)) {
      throw new ProblemDetail({ type: 'forbidden', title: 'Forbidden', status: 403, detail: 'You can only cancel your own booking requests.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending booking requests can be cancelled.' });
    }
    await prisma.bookingRequest.update({ where: { id: item.id }, data: { status: 'CANCELLED' } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewBookingRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewBookingRequestSchema>;
    const item = await prisma.bookingRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    if (item.status !== 'PENDING') {
      throw new ProblemDetail({ type: 'validation-error', title: 'Invalid Status', status: 422, detail: 'Only pending booking requests can be reviewed.' });
    }
    const updated = await prisma.bookingRequest.update({
      where: { id: item.id },
      data: { status: body.status, adminNote: body.adminNote },
    });
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as bookingRequestRoutes };
