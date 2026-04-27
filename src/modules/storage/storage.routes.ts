import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { PresignedUrlRequestSchema } from './storage.dto.js';
import { generatePresignedUrl } from './storage.service.js';
import { ProblemDetail } from '../../middlewares/error.middleware.js';
import crypto from 'node:crypto';

const router = Router();

function sanitizeFilename(filename: string): string {
  // Strip path traversal sequences first
  let base = filename.replace(/\.\./g, '');
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
  base = base.replace(/^\.+/, '');
  const lastDot = base.lastIndexOf('.');
  const ext = lastDot > 0 ? base.slice(lastDot) : '';
  const name = lastDot > 0 ? base.slice(0, lastDot) : base;
  const random = crypto.randomBytes(8).toString('hex');
  return `${name}_${random}${ext}`;
}

router.post(
  '/presigned-url',
  authenticate,
  validate(PresignedUrlRequestSchema),
  async (req, res, next) => {
    try {
      const { filename, contentType, operation } = req.body as z.infer<typeof PresignedUrlRequestSchema>;
      const key = sanitizeFilename(filename);
      const result = await generatePresignedUrl({
        key,
        operation,
        contentType,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(new ProblemDetail({
        type: 'storage-error',
        title: 'Storage Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'Failed to generate presigned URL',
      }));
    }
  },
);

export { router as storageRoutes };
