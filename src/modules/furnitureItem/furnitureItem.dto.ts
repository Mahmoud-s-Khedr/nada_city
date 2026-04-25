import { z } from 'zod';

/**
 * FurnitureItem DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);


/**
 * Schema for creating a new FurnitureItem.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateFurnitureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.string().datetime().optional(),
});

/**
 * Schema for full update of a FurnitureItem.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateFurnitureItemSchema = CreateFurnitureItemSchema;

/**
 * Schema for partial update (PATCH) of a FurnitureItem.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchFurnitureItemSchema = CreateFurnitureItemSchema.partial();

export const FurnitureItem_BookingsRelationSchema = z.object({
  id: z.string().optional(),
  furnitureItemId: z.string(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  details: z.string().nullish(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const FurnitureItem_FavoritesRelationSchema = z.object({
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
 * Schema describing the API response shape for a FurnitureItem.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const FurnitureItemResponseSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
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
export const FurnitureItemWithIncludesResponseSchema = FurnitureItemResponseSchema.extend({
  bookings: z.array(FurnitureItem_BookingsRelationSchema).optional(),
  favorites: z.array(FurnitureItem_FavoritesRelationSchema).optional(),
});

export type CreateFurnitureItemInput = z.infer<typeof CreateFurnitureItemSchema>;
export type UpdateFurnitureItemInput = z.infer<typeof UpdateFurnitureItemSchema>;
export type PatchFurnitureItemInput = z.infer<typeof PatchFurnitureItemSchema>;
export type FurnitureItemResponse = z.infer<typeof FurnitureItemResponseSchema>;
export type FurnitureItemWithIncludesResponse = z.infer<typeof FurnitureItemWithIncludesResponseSchema>;
