import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * Unit DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

export const UnitAvailabilitySchema = z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']);

export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);

/**
 * Nested input for location relation on Unit.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const Unit_LocationInput = z.object({
  create: z.object({
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  connect: z.object({
    id: z.string(),
  }).optional(),
}).refine(data => data.create || data.connect, {
  message: 'Either create or connect must be provided',
});

/**
 * Schema for creating a new Unit.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateUnitSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string().optional(),
  price: z.number(),
  availability: UnitAvailabilitySchema.optional(),
  type: UnitTypeSchema,
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  location: Unit_LocationInput,
});

/**
 * Schema for full update of a Unit.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateUnitSchema = CreateUnitSchema;

/**
 * Schema for partial update (PATCH) of a Unit.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchUnitSchema = CreateUnitSchema.partial();

export const Unit_LocationRelationSchema = z.object({
  id: z.string().optional(),
  address: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const Unit_BookingsRelationSchema = z.object({
  id: z.string().optional(),
  unitId: z.string(),
  userId: z.string(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  details: z.string().nullish(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const Unit_FavoritesRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: FavoriteTypeSchema,
  galleryItemId: z.string().nullish(),
  unitId: z.string().nullish(),
  finishId: z.string().nullish(),
  furnitureItemId: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
});

export const Unit_AcceptedSellRequestRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  price: decimalNumberSchema,
  type: UnitTypeSchema,
  address: z.string(),
  locationId: z.string().nullish(),
  details: z.string().nullish(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a Unit.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const UnitResponseSchema = z.object({
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

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const UnitWithIncludesResponseSchema = UnitResponseSchema.extend({
  location: Unit_LocationRelationSchema.optional(),
  bookings: z.array(Unit_BookingsRelationSchema).optional(),
  favorites: z.array(Unit_FavoritesRelationSchema).optional(),
  acceptedSellRequest: Unit_AcceptedSellRequestRelationSchema.nullable().optional(),
});

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;
export type PatchUnitInput = z.infer<typeof PatchUnitSchema>;
export type UnitResponse = z.infer<typeof UnitResponseSchema>;
export type UnitWithIncludesResponse = z.infer<typeof UnitWithIncludesResponseSchema>;
