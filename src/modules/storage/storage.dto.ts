import { z } from 'zod';

export const PresignedUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().optional(),
  operation: z.enum(['put', 'get']).default('put'),
}).strict();

export const PresignedUrlResponseSchema = z.object({
  url: z.string(),
  get_url: z.string().url(),
  key: z.string(),
  expiresIn: z.number(),
}).strict();

export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>;
export type PresignedUrlResponse = z.infer<typeof PresignedUrlResponseSchema>;
