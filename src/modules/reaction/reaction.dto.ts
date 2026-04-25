import { z } from 'zod';

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export const GalleryItemTypeSchema = z.enum(['UNIT', 'FINISH', 'FURNITURE']);
export const ReactionTypeSchema = z.enum(['LIKE', 'LOVE', 'WOW']);

export const CreateReactionSchema = z.object({
  type: ReactionTypeSchema.optional(),
  galleryItemId: z.string(),
}).strict();

export const UpdateReactionSchema = z.object({
  type: ReactionTypeSchema.optional(),
}).strict();

export const PatchReactionSchema = UpdateReactionSchema.partial();

export const Reaction_GalleryItemRelationSchema = z.object({
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

export const Reaction_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a Reaction.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const ReactionResponseSchema = z.object({
  id: z.string().optional(),
  type: ReactionTypeSchema.optional(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const ReactionWithIncludesResponseSchema = ReactionResponseSchema.extend({
  galleryItem: Reaction_GalleryItemRelationSchema.optional(),
  user: Reaction_UserRelationSchema.optional(),
});

export type CreateReactionInput = z.infer<typeof CreateReactionSchema>;
export type UpdateReactionInput = z.infer<typeof UpdateReactionSchema>;
export type PatchReactionInput = z.infer<typeof PatchReactionSchema>;
export type ReactionResponse = z.infer<typeof ReactionResponseSchema>;
export type ReactionWithIncludesResponse = z.infer<typeof ReactionWithIncludesResponseSchema>;
