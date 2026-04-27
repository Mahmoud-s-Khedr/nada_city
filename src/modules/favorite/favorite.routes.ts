import { Router } from 'express';
import { FavoriteController } from './favorite.controller.js';
import { CreateFavoriteSchema, UpdateFavoriteSchema, PatchFavoriteSchema } from './favorite.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new FavoriteController();





router.get('/', authenticate, (req, res, next) => controller.list(req, res, next));
router.get('/:id', authenticate, (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, authorize('USER', 'ADMIN'), validate(CreateFavoriteSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, authorize('USER', 'ADMIN'), validate(UpdateFavoriteSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, authorize('USER', 'ADMIN'), validate(PatchFavoriteSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, authorize('USER', 'ADMIN'), (req, res, next) => controller.remove(req, res, next));

export { router as favoriteRoutes };
