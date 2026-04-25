import { Router } from 'express';
import { OtpTokenController } from './otpToken.controller.js';
import { CreateOtpTokenSchema, UpdateOtpTokenSchema, PatchOtpTokenSchema } from './otpToken.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new OtpTokenController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, validate(CreateOtpTokenSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, validate(UpdateOtpTokenSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, validate(PatchOtpTokenSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => controller.remove(req, res, next));

export { router as otpTokenRoutes };
