import { z } from 'zod';
import { decimalNumberSchema } from '../../utils/zod-schemas.js';

/**
 * SellUnitRequest DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

export const UnitAvailabilitySchema = z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']);

/**
 * Nested input for user relation on SellUnitRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const SellUnitRequest_UserInput = z.object({
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
 * Schema for creating a new SellUnitRequest.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateSellUnitRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  type: UnitTypeSchema,
  address: z.string(),
  locationId: z.string().optional(),
  details: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  user: SellUnitRequest_UserInput,
});

/**
 * Schema for full update of a SellUnitRequest.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateSellUnitRequestSchema = CreateSellUnitRequestSchema;

/**
 * Schema for partial update (PATCH) of a SellUnitRequest.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchSellUnitRequestSchema = CreateSellUnitRequestSchema.partial();

export const CreateSellUnitRequestPublicSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  type: UnitTypeSchema,
  address: z.string(),
  locationId: z.string().optional(),
  details: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
}).strict();

export const ReviewSellUnitRequestSchema = CreateSellUnitRequestPublicSchema.partial().extend({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const SellUnitRequest_UserRelationSchema = z.object({
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

export const SellUnitRequest_AcceptedUnitRelationSchema = z.object({
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
 * Schema describing the API response shape for a SellUnitRequest.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const SellUnitRequestResponseSchema = z.object({
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
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const SellUnitRequestWithIncludesResponseSchema = SellUnitRequestResponseSchema.extend({
  user: SellUnitRequest_UserRelationSchema.optional(),
  acceptedUnit: SellUnitRequest_AcceptedUnitRelationSchema.nullable().optional(),
});

export type CreateSellUnitRequestInput = z.infer<typeof CreateSellUnitRequestSchema>;
export type UpdateSellUnitRequestInput = z.infer<typeof UpdateSellUnitRequestSchema>;
export type PatchSellUnitRequestInput = z.infer<typeof PatchSellUnitRequestSchema>;
export type SellUnitRequestResponse = z.infer<typeof SellUnitRequestResponseSchema>;
export type SellUnitRequestWithIncludesResponse = z.infer<typeof SellUnitRequestWithIncludesResponseSchema>;
