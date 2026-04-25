import { Router } from 'express';
import { GalleryItemController } from './galleryItem.controller.js';
import { CreateGalleryItemSchema, UpdateGalleryItemSchema, PatchGalleryItemSchema } from './galleryItem.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new GalleryItemController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/cursor', (req, res, next) => controller.listCursor(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, authorize('"ADMIN"'), validate(CreateGalleryItemSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, authorize('"ADMIN"'), validate(UpdateGalleryItemSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, authorize('"ADMIN"'), validate(PatchGalleryItemSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, authorize('"ADMIN"'), (req, res, next) => controller.remove(req, res, next));

export { router as galleryItemRoutes };
