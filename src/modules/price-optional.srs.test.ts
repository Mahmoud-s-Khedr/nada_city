import { describe, expect, it } from 'vitest';
import { CreateUnitSchema, UnitResponseSchema } from './unit/unit.dto.js';
import {
  CreateSellUnitRequestSchema,
  CreateSellUnitRequestPublicSchema,
  SellUnitRequestResponseSchema,
} from './sellUnitRequest/sellUnitRequest.dto.js';
import { CreateFurnitureItemSchema, FurnitureItemResponseSchema } from './furnitureItem/furnitureItem.dto.js';
import { CreateFinishSchema, FinishResponseSchema } from './finish/finish.dto.js';
import { BookingRequest_UnitRelationSchema } from './bookingRequest/bookingRequest.dto.js';
import { FurnitureBooking_FurnitureItemRelationSchema } from './furnitureBooking/furnitureBooking.dto.js';
import { FinishRequest_FinishRelationSchema } from './finishRequest/finishRequest.dto.js';
import {
  Favorite_UnitRelationSchema,
  Favorite_FinishRelationSchema,
  Favorite_FurnitureItemRelationSchema,
} from './favorite/favorite.dto.js';
import { Location_UnitsRelationSchema } from './location/location.dto.js';
import { User_SellUnitRequestsRelationSchema } from './user/user.dto.js';

describe('price optional rollout', () => {
  it('accepts create payloads without price', () => {
    expect(() => CreateUnitSchema.parse({
      title: 'Unit',
      description: 'Desc',
      type: 'RESIDENTIAL',
      location: { connect: { id: 'loc-1' } },
    })).not.toThrow();

    expect(() => CreateSellUnitRequestSchema.parse({
      title: 'Sell',
      description: 'Desc',
      type: 'RESIDENTIAL',
      address: 'Address',
      user: { connect: { id: 'user-1' } },
    })).not.toThrow();

    expect(() => CreateSellUnitRequestPublicSchema.parse({
      title: 'Sell',
      description: 'Desc',
      type: 'RESIDENTIAL',
      address: 'Address',
    })).not.toThrow();

    expect(() => CreateFurnitureItemSchema.parse({
      title: 'Chair',
      description: 'Desc',
    })).not.toThrow();

    expect(() => CreateFinishSchema.parse({
      title: 'Finish',
      description: 'Desc',
      type: 'INSIDE',
      subType: 'Paint',
    })).not.toThrow();
  });

  it('accepts null price in response and nested relation schemas', () => {
    expect(() => UnitResponseSchema.parse({
      id: 'unit-1',
      title: 'Unit',
      description: 'Desc',
      keywords: null,
      price: null,
      availability: 'AVAILABLE',
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
      acceptedSellRequestId: null,
      deletedAt: null,
    })).not.toThrow();

    expect(() => SellUnitRequestResponseSchema.parse({
      id: 'sell-1',
      userId: 'user-1',
      title: 'Sell',
      description: 'Desc',
      price: null,
      type: 'RESIDENTIAL',
      address: 'Addr',
      locationId: null,
      details: null,
      imageUrls: [],
      videoUrls: [],
      status: 'PENDING',
      adminNote: null,
    })).not.toThrow();

    expect(() => FurnitureItemResponseSchema.parse({
      id: 'furn-1',
      title: 'Chair',
      description: 'Desc',
      price: null,
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => FinishResponseSchema.parse({
      id: 'fin-1',
      title: 'Finish',
      description: 'Desc',
      price: null,
      type: 'INSIDE',
      subType: 'Paint',
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => BookingRequest_UnitRelationSchema.parse({
      id: 'unit-1',
      title: 'Unit',
      description: 'Desc',
      keywords: null,
      price: null,
      availability: 'AVAILABLE',
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
      acceptedSellRequestId: null,
      deletedAt: null,
    })).not.toThrow();

    expect(() => FurnitureBooking_FurnitureItemRelationSchema.parse({
      id: 'furn-1',
      title: 'Chair',
      description: 'Desc',
      price: null,
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => FinishRequest_FinishRelationSchema.parse({
      id: 'fin-1',
      title: 'Finish',
      description: 'Desc',
      price: null,
      type: 'INSIDE',
      subType: 'Paint',
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => Favorite_UnitRelationSchema.parse({
      id: 'unit-1',
      title: 'Unit',
      description: 'Desc',
      keywords: null,
      price: null,
      availability: 'AVAILABLE',
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
      acceptedSellRequestId: null,
      deletedAt: null,
    })).not.toThrow();

    expect(() => Favorite_FinishRelationSchema.parse({
      id: 'fin-1',
      title: 'Finish',
      description: 'Desc',
      price: null,
      type: 'INSIDE',
      subType: 'Paint',
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => Favorite_FurnitureItemRelationSchema.parse({
      id: 'furn-1',
      title: 'Chair',
      description: 'Desc',
      price: null,
      imageUrls: [],
      videoUrls: [],
      deletedAt: null,
    })).not.toThrow();

    expect(() => Location_UnitsRelationSchema.parse({
      id: 'unit-1',
      title: 'Unit',
      description: 'Desc',
      keywords: null,
      price: null,
      availability: 'AVAILABLE',
      type: 'RESIDENTIAL',
      imageUrls: [],
      videoUrls: [],
      locationId: 'loc-1',
      acceptedSellRequestId: null,
      deletedAt: null,
    })).not.toThrow();

    expect(() => User_SellUnitRequestsRelationSchema.parse({
      id: 'sell-1',
      userId: 'user-1',
      title: 'Sell',
      description: 'Desc',
      price: null,
      type: 'RESIDENTIAL',
      address: 'Addr',
      locationId: null,
      details: null,
      imageUrls: [],
      videoUrls: [],
      status: 'PENDING',
      adminNote: null,
    })).not.toThrow();
  });
});
