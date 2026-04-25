import { z } from 'zod';

/**
 * User DTOs (Data Transfer Objects)
 * Zod schemas for request validation and response shaping.
 */

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const RequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'AVAILABLE']);

export const UnitTypeSchema = z.enum(['RESIDENTIAL', 'COMMERCIAL']);

export const FavoriteTypeSchema = z.enum(['GALLERY_ITEM', 'UNIT', 'FINISH', 'FURNITURE']);

export const ReactionTypeSchema = z.enum(['LIKE', 'LOVE', 'WOW']);

export const WhatsappModuleSchema = z.enum(['GALLERY', 'UNIT', 'FINISH', 'FURNITURE', 'BOOKING', 'SELL_UNIT', 'ORDER_UNIT', 'SPECIAL_FURNITURE']);


/**
 * Schema for creating a new User.
 * Required fields from the Prisma schema are required here.
 * Optional fields (?) and fields with defaults are optional.
 * @bcm.readonly fields are excluded.
 */
export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().transform((v) => typeof v === 'string' ? v.trim() : v).transform((v) => typeof v === 'string' ? v.toLowerCase() : v), // Must be unique
  password: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  rate: z.number().optional(),
  role: RoleSchema.optional(),
  isVerified: z.boolean().optional(),
});

/**
 * Schema for full update of a User.
 * Same validation as Create -- all required fields must be present.
 */
export const UpdateUserSchema = CreateUserSchema;

/**
 * Schema for partial update (PATCH) of a User.
 * All fields are optional -- only provided fields are updated.
 */
export const PatchUserSchema = CreateUserSchema.partial();

export const User_CommentsRelationSchema = z.object({
  id: z.string().optional(),
  body: z.string(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const User_ReactionsRelationSchema = z.object({
  id: z.string().optional(),
  type: ReactionTypeSchema.optional(),
  galleryItemId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date().optional(),
});

export const User_FavoritesRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: FavoriteTypeSchema,
  galleryItemId: z.string().nullish(),
  unitId: z.string().nullish(),
  finishId: z.string().nullish(),
  furnitureItemId: z.string().nullish(),
  createdAt: z.coerce.date().optional(),
});

export const User_BookingsRelationSchema = z.object({
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

export const User_SellUnitRequestsRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
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

export const User_UnitOrderRequestsRelationSchema = z.object({
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

export const User_FinishRequestsRelationSchema = z.object({
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

export const User_FurnitureBookingsRelationSchema = z.object({
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

export const User_SpecialFurnitureRequestsRelationSchema = z.object({
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

export const User_WhatsappOpenEventsRelationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().nullish(),
  module: WhatsappModuleSchema,
  targetId: z.string().nullish(),
  defaultMessage: z.string(),
  createdAt: z.coerce.date().optional(),
});


/**
 * Schema describing the API response shape for a User.
 * @bcm.hidden and @bcm.writeOnly fields are excluded.
 */
export const UserResponseSchema = z.object({
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
 * Include-aware response schema for list/get endpoints when ?include=... is used.
 * Relations are optional because include is request-driven.
 */
export const UserWithIncludesResponseSchema = UserResponseSchema.extend({
  comments: z.array(User_CommentsRelationSchema).optional(),
  reactions: z.array(User_ReactionsRelationSchema).optional(),
  favorites: z.array(User_FavoritesRelationSchema).optional(),
  bookings: z.array(User_BookingsRelationSchema).optional(),
  sellUnitRequests: z.array(User_SellUnitRequestsRelationSchema).optional(),
  unitOrderRequests: z.array(User_UnitOrderRequestsRelationSchema).optional(),
  finishRequests: z.array(User_FinishRequestsRelationSchema).optional(),
  furnitureBookings: z.array(User_FurnitureBookingsRelationSchema).optional(),
  specialFurnitureRequests: z.array(User_SpecialFurnitureRequestsRelationSchema).optional(),
  whatsappOpenEvents: z.array(User_WhatsappOpenEventsRelationSchema).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type PatchUserInput = z.infer<typeof PatchUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserWithIncludesResponse = z.infer<typeof UserWithIncludesResponseSchema>;
