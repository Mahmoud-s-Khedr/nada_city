import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, assertOwnership } from '../../utils/auth.js';
import { CreateBookingRequestPublicSchema, ReviewBookingRequestSchema } from './bookingRequest.dto.js';
import { BookingRequestService } from './bookingRequest.service.js';

const router = Router();
const service = new BookingRequestService();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const filters = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
      ...(typeof req.query.unitId === 'string' ? { unitId: req.query.unitId } : {}),
    };
    const data = await service.findAll(filters);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await service.findByUserId(getAuthUserId(req));
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await service.findOne({ id: String(req.params.id) }, { unit: true, user: true });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    assertOwnership(item, req, 'view');
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateBookingRequestPublicSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateBookingRequestPublicSchema>;
    const created = await service.createBooking(body, getAuthUserId(req));
    sendCreated(res, created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await service.findOne({ id: String(req.params.id) });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Booking request not found.' });
    }
    assertOwnership(item, req, 'cancel');
    await service.cancel({ id: String(req.params.id) });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewBookingRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewBookingRequestSchema>;
    const updated = await service.review({ id: String(req.params.id) }, body);
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as bookingRequestRoutes };
