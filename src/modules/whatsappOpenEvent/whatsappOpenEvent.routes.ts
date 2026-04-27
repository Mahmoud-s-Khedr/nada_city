import { Router } from 'express';
import { WhatsappOpenEventController } from './whatsappOpenEvent.controller.js';
import { CreateWhatsappOpenEventSchema, UpdateWhatsappOpenEventSchema, PatchWhatsappOpenEventSchema } from './whatsappOpenEvent.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new WhatsappOpenEventController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/cursor', (req, res, next) => controller.listCursor(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateWhatsappOpenEventSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, authorize('USER', 'ADMIN'), validate(UpdateWhatsappOpenEventSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, authorize('USER', 'ADMIN'), validate(PatchWhatsappOpenEventSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, authorize('USER', 'ADMIN'), (req, res, next) => controller.remove(req, res, next));

export { router as whatsappOpenEventRoutes };
