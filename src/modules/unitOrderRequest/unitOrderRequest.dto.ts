import { z } from 'zod';

/**
 * UnitOrderRequest DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

/**
 * Nested input for user relation on UnitOrderRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const UnitOrderRequest_UserInput = z.object({
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
 * Schema for creating a new UnitOrderRequest.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateUnitOrderRequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  type: UnitTypeSchema.optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  details: z.string().optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  user: UnitOrderRequest_UserInput,
});

/**
 * Schema for full update of a UnitOrderRequest.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateUnitOrderRequestSchema = CreateUnitOrderRequestSchema;

/**
 * Schema for partial update (PATCH) of a UnitOrderRequest.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchUnitOrderRequestSchema = CreateUnitOrderRequestSchema.partial();

export const CreateUnitOrderRequestPublicSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  type: UnitTypeSchema.optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  details: z.string().optional(),
}).strict();

export const ReviewUnitOrderRequestSchema = z.object({
  status: z.enum(['AVAILABLE', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const UnitOrderRequest_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a UnitOrderRequest.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const UnitOrderRequestResponseSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  minPrice: z.number().nullish(),
  maxPrice: z.number().nullish(),
  type: UnitTypeSchema.nullish(),
  address: z.string().nullish(),
  location: z.string().nullish(),
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
export const UnitOrderRequestWithIncludesResponseSchema = UnitOrderRequestResponseSchema.extend({
  user: UnitOrderRequest_UserRelationSchema.optional(),
});

export type CreateUnitOrderRequestInput = z.infer<typeof CreateUnitOrderRequestSchema>;
export type UpdateUnitOrderRequestInput = z.infer<typeof UpdateUnitOrderRequestSchema>;
export type PatchUnitOrderRequestInput = z.infer<typeof PatchUnitOrderRequestSchema>;
export type UnitOrderRequestResponse = z.infer<typeof UnitOrderRequestResponseSchema>;
export type UnitOrderRequestWithIncludesResponse = z.infer<typeof UnitOrderRequestWithIncludesResponseSchema>;
