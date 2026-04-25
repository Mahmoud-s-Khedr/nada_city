import { z } from 'zod';

/**
 * GalleryItem DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const GalleryItemTypeSchema = z.enum(['UNIT', 'FINISH', 'FURNITURE']);

export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);

export const ReactionTypeSchema = z.enum(['LIKE', 'LOVE', 'WOW']);


/**
 * Schema for creating a new GalleryItem.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateGalleryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  details: z.string().optional(),
  keywords: z.string().optional(),
  type: GalleryItemTypeSchema,
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.string().datetime().optional(),
});

/**
 * Schema for full update of a GalleryItem.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateGalleryItemSchema = CreateGalleryItemSchema;

/**
 * Schema for partial update (PATCH) of a GalleryItem.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchGalleryItemSchema = CreateGalleryItemSchema.partial();

export const GalleryItem_CommentsRelationSchema = z.object({
  id: z.string().optional(),
  body: z.string(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const GalleryItem_ReactionsRelationSchema = z.object({
  id: z.string().optional(),
  type: ReactionTypeSchema.optional(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const GalleryItem_FavoritesRelationSchema = z.object({
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
 * Schema describing the API response shape for a GalleryItem.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const GalleryItemResponseSchema = z.object({
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

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const GalleryItemWithIncludesResponseSchema = GalleryItemResponseSchema.extend({
  comments: z.array(GalleryItem_CommentsRelationSchema).optional(),
  reactions: z.array(GalleryItem_ReactionsRelationSchema).optional(),
  favorites: z.array(GalleryItem_FavoritesRelationSchema).optional(),
});

export type CreateGalleryItemInput = z.infer<typeof CreateGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof UpdateGalleryItemSchema>;
export type PatchGalleryItemInput = z.infer<typeof PatchGalleryItemSchema>;
export type GalleryItemResponse = z.infer<typeof GalleryItemResponseSchema>;
export type GalleryItemWithIncludesResponse = z.infer<typeof GalleryItemWithIncludesResponseSchema>;
