import { Router } from 'express';
import { LocationController } from './location.controller.js';
import { CreateLocationSchema, UpdateLocationSchema, PatchLocationSchema } from './location.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new LocationController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, authorize('ADMIN'), validate(CreateLocationSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, authorize('ADMIN'), validate(UpdateLocationSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, authorize('ADMIN'), validate(PatchLocationSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, authorize('ADMIN'), (req, res, next) => controller.remove(req, res, next));

export { router as locationRoutes };
