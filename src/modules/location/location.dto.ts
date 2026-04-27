import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * Location DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

export const UnitAvailabilitySchema = z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']);


/**
 * Schema for creating a new Location.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateLocationSchema = z.object({
  address: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/**
 * Schema for full update of a Location.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateLocationSchema = CreateLocationSchema;

/**
 * Schema for partial update (PATCH) of a Location.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchLocationSchema = CreateLocationSchema.partial();

export const Location_UnitsRelationSchema = z.object({
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
 * Schema describing the API response shape for a Location.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const LocationResponseSchema = z.object({
  id: z.string().optional(),
  address: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const LocationWithIncludesResponseSchema = LocationResponseSchema.extend({
  units: z.array(Location_UnitsRelationSchema).optional(),
});

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type PatchLocationInput = z.infer<typeof PatchLocationSchema>;
export type LocationResponse = z.infer<typeof LocationResponseSchema>;
export type LocationWithIncludesResponse = z.infer<typeof LocationWithIncludesResponseSchema>;
