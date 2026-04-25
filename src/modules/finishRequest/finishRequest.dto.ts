import { z } from 'zod';

/**
 * FinishRequest DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const FinishTypeSchema = z.enum(['INSIDE', 'OUTSIDE']);

/**
 * Nested input for user relation on FinishRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const FinishRequest_UserInput = z.object({
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
 * Nested input for finish relation on FinishRequest.
 * Supports Prisma's nested create syntax or selector-aware connect syntax.
 */
export const FinishRequest_FinishInput = z.object({
  create: z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    type: FinishTypeSchema,
    subType: z.string(),
    imageUrls: z.array(z.string()).optional(),
    videoUrls: z.array(z.string()).optional(),
    deletedAt: z.string().datetime().optional(),
  }).optional(),
  connect: z.object({
    id: z.string(),
  }).optional(),
}).refine(data => data.create || data.connect, {
  message: 'Either create or connect must be provided',
});

/**
 * Schema for creating a new FinishRequest.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateFinishRequestSchema = z.object({
  address: z.string(),
  requestedAt: z.string().datetime(),
  finishTypes: z.array(z.string()),
  details: z.string().optional(),
  status: RequestStatusSchema.optional(),
  adminNote: z.string().optional(),
  user: FinishRequest_UserInput,
  finish: FinishRequest_FinishInput.optional(),
});

/**
 * Schema for full update of a FinishRequest.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateFinishRequestSchema = CreateFinishRequestSchema;

/**
 * Schema for partial update (PATCH) of a FinishRequest.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchFinishRequestSchema = CreateFinishRequestSchema.partial();

export const CreateFinishRequestPublicSchema = z.object({
  finishId: z.string().optional(),
  address: z.string(),
  requestedAt: z.string().datetime(),
  finishTypes: z.array(z.string()),
  details: z.string().optional(),
}).strict();

export const ReviewFinishRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  adminNote: z.string().optional(),
}).strict();

export const FinishRequest_UserRelationSchema = z.object({
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

export const FinishRequest_FinishRelationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  type: FinishTypeSchema,
  subType: z.string(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  deletedAt: z.coerce.date().nullish(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a FinishRequest.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const FinishRequestResponseSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  finishId: z.string().nullish(),
  address: z.string(),
  requestedAt: z.coerce.date(),
  finishTypes: z.array(z.string()),
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
export const FinishRequestWithIncludesResponseSchema = FinishRequestResponseSchema.extend({
  user: FinishRequest_UserRelationSchema.optional(),
  finish: FinishRequest_FinishRelationSchema.nullable().optional(),
});

export type CreateFinishRequestInput = z.infer<typeof CreateFinishRequestSchema>;
export type UpdateFinishRequestInput = z.infer<typeof UpdateFinishRequestSchema>;
export type PatchFinishRequestInput = z.infer<typeof PatchFinishRequestSchema>;
export type FinishRequestResponse = z.infer<typeof FinishRequestResponseSchema>;
export type FinishRequestWithIncludesResponse = z.infer<typeof FinishRequestWithIncludesResponseSchema>;
