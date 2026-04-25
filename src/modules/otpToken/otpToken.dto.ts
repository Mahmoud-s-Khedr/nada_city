import { z } from 'zod';

/**
 * OtpToken DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */


/**
 * Schema for creating a new OtpToken.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateOtpTokenSchema = z.object({
  email: z.string(),
  code: z.string(),
  consumed: z.boolean().optional(),
  expiresAt: z.string().datetime(),
});

/**
 * Schema for full update of a OtpToken.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateOtpTokenSchema = CreateOtpTokenSchema;

/**
 * Schema for partial update (PATCH) of a OtpToken.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchOtpTokenSchema = CreateOtpTokenSchema.partial();


/**
 * Schema describing the API response shape for a OtpToken.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const OtpTokenResponseSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  code: z.string(),
  consumed: z.boolean().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const OtpTokenWithIncludesResponseSchema = OtpTokenResponseSchema.extend({
});

export type CreateOtpTokenInput = z.infer<typeof CreateOtpTokenSchema>;
export type UpdateOtpTokenInput = z.infer<typeof UpdateOtpTokenSchema>;
export type PatchOtpTokenInput = z.infer<typeof PatchOtpTokenSchema>;
export type OtpTokenResponse = z.infer<typeof OtpTokenResponseSchema>;
export type OtpTokenWithIncludesResponse = z.infer<typeof OtpTokenWithIncludesResponseSchema>;
