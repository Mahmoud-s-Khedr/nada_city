import { z } from 'zod';

/**
 * SpecialFurnitureRequest DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

/**
 * Nested input for user relation on SpecialFurnitureRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const SpecialFurnitureRequest_UserInput = z.object({
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
 * Schema for creating a new SpecialFurnitureRequest.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateSpecialFurnitureRequestSchema = z.object({
  name: z.string(),
  phone: z.string(),
  details: z.string(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  user: SpecialFurnitureRequest_UserInput,
});

/**
 * Schema for full update of a SpecialFurnitureRequest.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateSpecialFurnitureRequestSchema = CreateSpecialFurnitureRequestSchema;

/**
 * Schema for partial update (PATCH) of a SpecialFurnitureRequest.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchSpecialFurnitureRequestSchema = CreateSpecialFurnitureRequestSchema.partial();

export const CreateSpecialFurnitureRequestPublicSchema = z.object({
  name: z.string(),
  phone: z.string(),
  details: z.string(),
}).strict();

export const ReviewSpecialFurnitureRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const SpecialFurnitureRequest_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a SpecialFurnitureRequest.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const SpecialFurnitureRequestResponseSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  details: z.string(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const SpecialFurnitureRequestWithIncludesResponseSchema = SpecialFurnitureRequestResponseSchema.extend({
  user: SpecialFurnitureRequest_UserRelationSchema.optional(),
});

export type CreateSpecialFurnitureRequestInput = z.infer<typeof CreateSpecialFurnitureRequestSchema>;
export type UpdateSpecialFurnitureRequestInput = z.infer<typeof UpdateSpecialFurnitureRequestSchema>;
export type PatchSpecialFurnitureRequestInput = z.infer<typeof PatchSpecialFurnitureRequestSchema>;
export type SpecialFurnitureRequestResponse = z.infer<typeof SpecialFurnitureRequestResponseSchema>;
export type SpecialFurnitureRequestWithIncludesResponse = z.infer<typeof SpecialFurnitureRequestWithIncludesResponseSchema>;
