import { z } from 'zod';

export const CreateCommentSchema = z.object({
  body: z.string().min(1),
  galleryItemId: z.string(),
}).strict();

export const UpdateCommentSchema = z.object({
  body: z.string().min(1),
}).strict();

export const PatchCommentSchema = UpdateCommentSchema.partial();

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export const GalleryItemTypeSchema = z.enum(['UNIT', 'FINISH', 'FURNITURE']);

export const Comment_GalleryItemRelationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  details: z.string().nullish(),
  keywords: z.string().nullish(),
  type: GalleryItemTypeSchema,
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const Comment_UserRelationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  rate: z.number().optional(),
  role: RoleSchema.optional(),
  isVerified: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a Comment.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const CommentResponseSchema = z.object({
  id: z.string().optional(),
  body: z.string(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const CommentWithIncludesResponseSchema = CommentResponseSchema.extend({
  galleryItem: Comment_GalleryItemRelationSchema.optional(),
  user: Comment_UserRelationSchema.optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type PatchCommentInput = z.infer<typeof PatchCommentSchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type CommentWithIncludesResponse = z.infer<typeof CommentWithIncludesResponseSchema>;
