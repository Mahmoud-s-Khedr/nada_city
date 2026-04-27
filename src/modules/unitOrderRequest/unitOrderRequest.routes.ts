import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import { getAuthUserId, assertOwnership } from '../../utils/auth.js';
import { CreateUnitOrderRequestPublicSchema, ReviewUnitOrderRequestSchema } from './unitOrderRequest.dto.js';
import { UnitOrderRequestService } from './unitOrderRequest.service.js';

const router = Router();
const service = new UnitOrderRequestService();

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const filters = {
      ...(typeof req.query.status === 'string' ? { status: req.query.status } : {}),
      ...(typeof req.query.userId === 'string' ? { userId: req.query.userId } : {}),
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
    const item = await service.findOne({ id: String(req.params.id) }, { user: true });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Unit order request not found.' });
    }
    assertOwnership(item, req, 'view');
    sendSuccess(res, item);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateUnitOrderRequestPublicSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateUnitOrderRequestPublicSchema>;
    const created = await service.create({ ...body, userId: getAuthUserId(req) } as any);
    sendCreated(res, created);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const item = await service.findOne({ id: String(req.params.id) });
    if (!item) {
      throw new ProblemDetail({ type: 'not-found', title: 'Not Found', status: 404, detail: 'Unit order request not found.' });
    }
    assertOwnership(item, req, 'cancel');
    await service.cancel({ id: String(req.params.id) });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/review', authenticate, authorize('ADMIN'), validate(ReviewUnitOrderRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof ReviewUnitOrderRequestSchema>;
    const updated = await service.review({ id: String(req.params.id) }, body);
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

export { router as unitOrderRequestRoutes };
