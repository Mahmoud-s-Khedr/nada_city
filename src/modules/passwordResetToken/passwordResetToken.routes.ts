import { Router } from 'express';
import { PasswordResetTokenController } from './passwordResetToken.controller.js';
import { CreatePasswordResetTokenSchema, UpdatePasswordResetTokenSchema, PatchPasswordResetTokenSchema } from './passwordResetToken.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new PasswordResetTokenController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, validate(CreatePasswordResetTokenSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, validate(UpdatePasswordResetTokenSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, validate(PatchPasswordResetTokenSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => controller.remove(req, res, next));

export { router as passwordResetTokenRoutes };
