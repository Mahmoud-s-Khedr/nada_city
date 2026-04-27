import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * BookingRequest DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

export const UnitAvailabilitySchema = z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']);

/**
 * Nested input for unit relation on BookingRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const BookingRequest_UnitInput = z.object({
  create: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string().optional(),
    price: z.number(),
    availability: UnitAvailabilitySchema.optional(),
    type: UnitTypeSchema,
    imageUrls: z.array(z.string()).optional(),
    videoUrls: z.array(z.string()).optional(),
    locationId: z.string(),
  }).optional(),
  connect: z.object({
    id: z.string(),
  }).optional(),
}).refine(data => data.create || data.connect, {
  message: 'Either create or connect must be provided',
});
/**
 * Nested input for user relation on BookingRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const BookingRequest_UserInput = z.object({
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
 * Schema for creating a new BookingRequest.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateBookingRequestSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  details: z.string().optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  unit: BookingRequest_UnitInput,
  user: BookingRequest_UserInput,
});

/**
 * Schema for full update of a BookingRequest.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateBookingRequestSchema = CreateBookingRequestSchema;

/**
 * Schema for partial update (PATCH) of a BookingRequest.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchBookingRequestSchema = CreateBookingRequestSchema.partial();

export const CreateBookingRequestPublicSchema = z.object({
  unitId: z.string(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  details: z.string().optional(),
}).strict();

export const ReviewBookingRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const BookingRequest_UnitRelationSchema = z.object({
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

export const BookingRequest_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a BookingRequest.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const BookingRequestResponseSchema = z.object({
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

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const BookingRequestWithIncludesResponseSchema = BookingRequestResponseSchema.extend({
  unit: BookingRequest_UnitRelationSchema.optional(),
  user: BookingRequest_UserRelationSchema.optional(),
});

export type CreateBookingRequestInput = z.infer<typeof CreateBookingRequestSchema>;
export type UpdateBookingRequestInput = z.infer<typeof UpdateBookingRequestSchema>;
export type PatchBookingRequestInput = z.infer<typeof PatchBookingRequestSchema>;
export type BookingRequestResponse = z.infer<typeof BookingRequestResponseSchema>;
export type BookingRequestWithIncludesResponse = z.infer<typeof BookingRequestWithIncludesResponseSchema>;
