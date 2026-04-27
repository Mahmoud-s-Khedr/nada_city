import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * Finish DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const FinishTypeSchema = z.enum(['INSIDE', 'OUTSIDE']);

export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);


/**
 * Schema for creating a new Finish.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateFinishSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  type: FinishTypeSchema,
  subType: z.string(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
});

/**
 * Schema for full update of a Finish.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateFinishSchema = CreateFinishSchema;

/**
 * Schema for partial update (PATCH) of a Finish.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchFinishSchema = CreateFinishSchema.partial();

export const Finish_RequestsRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  finishId: z.string().nullish(),
  address: z.string(),
  requestedAt: z.coerce.date(),
  finishTypes: z.array(z.string()),
  details: z.string().nullish(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const Finish_FavoritesRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: FavoriteTypeSchema,
  galleryItemId: z.string().nullish(),
  unitId: z.string().nullish(),
  finishId: z.string().nullish(),
  furnitureItemId: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a Finish.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const FinishResponseSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  price: decimalNumberSchema,
  type: FinishTypeSchema,
  subType: z.string(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const FinishWithIncludesResponseSchema = FinishResponseSchema.extend({
  requests: z.array(Finish_RequestsRelationSchema).optional(),
  favorites: z.array(Finish_FavoritesRelationSchema).optional(),
});

export type CreateFinishInput = z.infer<typeof CreateFinishSchema>;
export type UpdateFinishInput = z.infer<typeof UpdateFinishSchema>;
export type PatchFinishInput = z.infer<typeof PatchFinishSchema>;
export type FinishResponse = z.infer<typeof FinishResponseSchema>;
export type FinishWithIncludesResponse = z.infer<typeof FinishWithIncludesResponseSchema>;
