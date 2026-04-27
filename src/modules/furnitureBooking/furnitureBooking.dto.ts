import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * FurnitureBooking DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

/**
 * Nested input for furnitureItem relation on FurnitureBooking.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const FurnitureBooking_FurnitureItemInput = z.object({
  create: z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrls: z.array(z.string()).optional(),
    videoUrls: z.array(z.string()).optional(),
  }).optional(),
  connect: z.object({
    id: z.string(),
  }).optional(),
}).refine(data => data.create || data.connect, {
  message: 'Either create or connect must be provided',
});
/**
 * Nested input for user relation on FurnitureBooking.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const FurnitureBooking_UserInput = z.object({
  create: z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    phone: z.string().optional(),
    address: z.string().optional(),
    rate: z.number().optional(),
    role: RoleSchema.optional(),
    isVerified: z.boolean().optional(),
  }).optional(),
  connect: z.object({
    id: z.string(),
  }).optional(),
}).refine(data => data.create || data.connect, {
  message: 'Either create or connect must be provided',
});

/**
 * Schema for creating a new FurnitureBooking.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateFurnitureBookingSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  details: z.string().optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  furnitureItem: FurnitureBooking_FurnitureItemInput,
  user: FurnitureBooking_UserInput,
});

/**
 * Schema for full update of a FurnitureBooking.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateFurnitureBookingSchema = CreateFurnitureBookingSchema;

/**
 * Schema for partial update (PATCH) of a FurnitureBooking.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchFurnitureBookingSchema = CreateFurnitureBookingSchema.partial();

export const CreateFurnitureBookingPublicSchema = z.object({
  furnitureItemId: z.string(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  details: z.string().optional(),
}).strict();

export const ReviewFurnitureBookingSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const FurnitureBooking_FurnitureItemRelationSchema = z.object({
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

export const FurnitureBooking_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a FurnitureBooking.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const FurnitureBookingResponseSchema = z.object({
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

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const FurnitureBookingWithIncludesResponseSchema = FurnitureBookingResponseSchema.extend({
  furnitureItem: FurnitureBooking_FurnitureItemRelationSchema.optional(),
  user: FurnitureBooking_UserRelationSchema.optional(),
});

export type CreateFurnitureBookingInput = z.infer<typeof CreateFurnitureBookingSchema>;
export type UpdateFurnitureBookingInput = z.infer<typeof UpdateFurnitureBookingSchema>;
export type PatchFurnitureBookingInput = z.infer<typeof PatchFurnitureBookingSchema>;
export type FurnitureBookingResponse = z.infer<typeof FurnitureBookingResponseSchema>;
export type FurnitureBookingWithIncludesResponse = z.infer<typeof FurnitureBookingWithIncludesResponseSchema>;
