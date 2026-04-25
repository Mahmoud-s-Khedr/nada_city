import { z } from 'zod';

/**
 * PasswordResetToken DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */


/**
 * Schema for creating a new PasswordResetToken.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreatePasswordResetTokenSchema = z.object({
  email: z.string(),
  token: z.string(), // Must be unique
  consumed: z.boolean().optional(),
  expiresAt: z.string().datetime(),
});

/**
 * Schema for full update of a PasswordResetToken.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdatePasswordResetTokenSchema = CreatePasswordResetTokenSchema;

/**
 * Schema for partial update (PATCH) of a PasswordResetToken.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchPasswordResetTokenSchema = CreatePasswordResetTokenSchema.partial();


/**
 * Schema describing the API response shape for a PasswordResetToken.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const PasswordResetTokenResponseSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  token: z.string(),
  consumed: z.boolean().optional(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const PasswordResetTokenWithIncludesResponseSchema = PasswordResetTokenResponseSchema.extend({
});

export type CreatePasswordResetTokenInput = z.infer<typeof CreatePasswordResetTokenSchema>;
export type UpdatePasswordResetTokenInput = z.infer<typeof UpdatePasswordResetTokenSchema>;
export type PatchPasswordResetTokenInput = z.infer<typeof PatchPasswordResetTokenSchema>;
export type PasswordResetTokenResponse = z.infer<typeof PasswordResetTokenResponseSchema>;
export type PasswordResetTokenWithIncludesResponse = z.infer<typeof PasswordResetTokenWithIncludesResponseSchema>;
