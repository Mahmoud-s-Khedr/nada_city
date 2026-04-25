import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);
export const UnitAvailabilitySchema = z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']);
export const GalleryItemTypeSchema = z.enum(['UNIT', 'FINISH', 'FURNITURE']);
export const FinishTypeSchema = z.enum(['INSIDE', 'OUTSIDE']);
export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);

const FavoriteTargetSchema = z.object({
  type: FavoriteTypeSchema,
  galleryItemId: z.string().optional(),
  unitId: z.string().optional(),
  finishId: z.string().optional(),
  furnitureItemId: z.string().optional(),
}).strict();

export const CreateFavoriteSchema = FavoriteTargetSchema.refine((data) => [data.galleryItemId, data.unitId, data.finishId, data.furnitureItemId].filter(Boolean).length === 1, {
  message: 'Exactly one target id must be provided.',
});

export const UpdateFavoriteSchema = CreateFavoriteSchema;
export const PatchFavoriteSchema = FavoriteTargetSchema.partial().strict();

export const Favorite_UserRelationSchema = z.object({
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

export const Favorite_GalleryItemRelationSchema = z.object({
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

export const Favorite_UnitRelationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  keywords: z.string().nullish(),
  price: decimalNumberSchema,
  availability: UnitAvailabilitySchema.optional(),
  type: UnitTypeSchema,
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  locationId: z.string(),
  acceptedSellRequestId: z.string().nullish(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const Favorite_FinishRelationSchema = z.object({
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

export const Favorite_FurnitureItemRelationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  price: decimalNumberSchema,
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a Favorite.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const FavoriteResponseSchema = z.object({
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
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const FavoriteWithIncludesResponseSchema = FavoriteResponseSchema.extend({
  user: Favorite_UserRelationSchema.optional(),
  galleryItem: Favorite_GalleryItemRelationSchema.nullable().optional(),
  unit: Favorite_UnitRelationSchema.nullable().optional(),
  finish: Favorite_FinishRelationSchema.nullable().optional(),
  furnitureItem: Favorite_FurnitureItemRelationSchema.nullable().optional(),
});

export type CreateFavoriteInput = z.infer<typeof CreateFavoriteSchema>;
export type UpdateFavoriteInput = z.infer<typeof UpdateFavoriteSchema>;
export type PatchFavoriteInput = z.infer<typeof PatchFavoriteSchema>;
export type FavoriteResponse = z.infer<typeof FavoriteResponseSchema>;
export type FavoriteWithIncludesResponse = z.infer<typeof FavoriteWithIncludesResponseSchema>;
