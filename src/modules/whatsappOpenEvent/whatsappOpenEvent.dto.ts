import { z } from 'zod';

/**
 * WhatsappOpenEvent DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const WhatsappModuleSchema = z.enum(['GALLERY', 'UNIT', 'FINISH', 'FURNITURE', 'BOOKING', 'SELL_UNIT', 'ORDER_UNIT', 'SPECIAL_FURNITURE']);


/**
 * Schema for creating a new WhatsappOpenEvent.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateWhatsappOpenEventSchema = z.object({
  userId: z.string().optional(),
  module: WhatsappModuleSchema,
  targetId: z.string().optional(),
  defaultMessage: z.string(),
});

/**
 * Schema for full update of a WhatsappOpenEvent.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateWhatsappOpenEventSchema = CreateWhatsappOpenEventSchema;

/**
 * Schema for partial update (PATCH) of a WhatsappOpenEvent.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchWhatsappOpenEventSchema = CreateWhatsappOpenEventSchema.partial();

export const WhatsappOpenEvent_UserRelationSchema = z.object({
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
 * Schema describing the API response shape for a WhatsappOpenEvent.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const WhatsappOpenEventResponseSchema = z.object({
  id: z.string().optional(),
  userId: z.string().nullish(),
  module: WhatsappModuleSchema,
  targetId: z.string().nullish(),
  defaultMessage: z.string(),
  createdAt: z.coerce.date().optional(),
});

/**
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const WhatsappOpenEventWithIncludesResponseSchema = WhatsappOpenEventResponseSchema.extend({
  user: WhatsappOpenEvent_UserRelationSchema.nullable().optional(),
});

export type CreateWhatsappOpenEventInput = z.infer<typeof CreateWhatsappOpenEventSchema>;
export type UpdateWhatsappOpenEventInput = z.infer<typeof UpdateWhatsappOpenEventSchema>;
export type PatchWhatsappOpenEventInput = z.infer<typeof PatchWhatsappOpenEventSchema>;
export type WhatsappOpenEventResponse = z.infer<typeof WhatsappOpenEventResponseSchema>;
export type WhatsappOpenEventWithIncludesResponse = z.infer<typeof WhatsappOpenEventWithIncludesResponseSchema>;
