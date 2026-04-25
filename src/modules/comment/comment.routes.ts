import { Router } from 'express';
import { CommentController } from './comment.controller.js';
import { CreateCommentSchema, UpdateCommentSchema, PatchCommentSchema } from './comment.dto.js';
import { validate } from '../../middlewares/validation.middleware.js';

import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
const controller = new CommentController();





router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/cursor', (req, res, next) => controller.listCursor(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));

router.post('/', authenticate, authorize('"USER"', '"ADMIN"'), validate(CreateCommentSchema), (req, res, next) => controller.create(req, res, next));
router.put('/:id', authenticate, authorize('"USER"', '"ADMIN"'), validate(UpdateCommentSchema), (req, res, next) => controller.update(req, res, next));
router.patch('/:id', authenticate, authorize('"USER"', '"ADMIN"'), validate(PatchCommentSchema), (req, res, next) => controller.patch(req, res, next));
router.delete('/:id', authenticate, authorize('"USER"', '"ADMIN"'), (req, res, next) => controller.remove(req, res, next));

export { router as commentRoutes };
