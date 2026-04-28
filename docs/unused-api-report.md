# Unused API Report

This report compares the live Express route surface with the SRS client-flow routes documented in `docs/user-flows.md`.

Generated on: 2026-04-25T01:54:22.923Z

## Summary

- Live routes discovered: 107
- Routes covered by SRS flows: 79
- Live routes not covered by SRS flows: 28

## Covered Routes

| Method | Path | Flow |
|---|---|---|
| POST | `/api/v1/auth/forgot-password` | Password recovery flow |
| POST | `/api/v1/auth/login` | Session flow |
| POST | `/api/v1/auth/logout` | Session flow |
| POST | `/api/v1/auth/refresh` | Session flow |
| POST | `/api/v1/auth/register` | Registration flow |
| POST | `/api/v1/auth/reset-password` | Password recovery flow |
| POST | `/api/v1/auth/verify-otp` | Registration flow |
| GET | `/api/v1/bookingRequests` | Admin booking review flow |
| POST | `/api/v1/bookingRequests` | Booking flow |
| DELETE | `/api/v1/bookingRequests/:id` | Booking flow |
| GET | `/api/v1/bookingRequests/:id` | Booking flow |
| PATCH | `/api/v1/bookingRequests/:id/review` | Admin booking review flow |
| GET | `/api/v1/bookingRequests/me` | Booking flow |
| POST | `/api/v1/comments` | Gallery interaction flow |
| DELETE | `/api/v1/comments/:id` | Gallery interaction flow |
| PATCH | `/api/v1/comments/:id` | Gallery interaction flow |
| GET | `/api/v1/favorites` | Gallery interaction flow |
| POST | `/api/v1/favorites` | Gallery interaction flow |
| DELETE | `/api/v1/favorites/:id` | Gallery interaction flow |
| GET | `/api/v1/finishes` | Finish flow |
| POST | `/api/v1/finishes` | Admin finish catalog flow |
| DELETE | `/api/v1/finishes/:id` | Admin finish catalog flow |
| GET | `/api/v1/finishes/:id` | Finish flow |
| PATCH | `/api/v1/finishes/:id` | Admin finish catalog flow |
| PUT | `/api/v1/finishes/:id` | Admin finish catalog flow |
| GET | `/api/v1/finishRequests` | Admin finish review flow |
| POST | `/api/v1/finishRequests` | Finish request flow |
| DELETE | `/api/v1/finishRequests/:id` | Finish request flow |
| GET | `/api/v1/finishRequests/:id` | Finish request flow |
| PATCH | `/api/v1/finishRequests/:id/review` | Admin finish review flow |
| GET | `/api/v1/finishRequests/me` | Finish request flow |
| GET | `/api/v1/furnitureBookings` | Admin furniture-booking review flow |
| POST | `/api/v1/furnitureBookings` | Furniture booking flow |
| DELETE | `/api/v1/furnitureBookings/:id` | Furniture booking flow |
| GET | `/api/v1/furnitureBookings/:id` | Furniture booking flow |
| PATCH | `/api/v1/furnitureBookings/:id/review` | Admin furniture-booking review flow |
| GET | `/api/v1/furnitureBookings/me` | Furniture booking flow |
| GET | `/api/v1/furnitureItems` | Furniture flow |
| POST | `/api/v1/furnitureItems` | Admin furniture catalog flow |
| DELETE | `/api/v1/furnitureItems/:id` | Admin furniture catalog flow |
| GET | `/api/v1/furnitureItems/:id` | Furniture flow |
| PATCH | `/api/v1/furnitureItems/:id` | Admin furniture catalog flow |
| PUT | `/api/v1/furnitureItems/:id` | Admin furniture catalog flow |
| GET | `/api/v1/galleryItems` | Gallery flow |
| POST | `/api/v1/galleryItems` | Admin gallery catalog flow |
| DELETE | `/api/v1/galleryItems/:id` | Admin gallery catalog flow |
| GET | `/api/v1/galleryItems/:id` | Gallery flow |
| PATCH | `/api/v1/galleryItems/:id` | Admin gallery catalog flow |
| PUT | `/api/v1/galleryItems/:id` | Admin gallery catalog flow |
| POST | `/api/v1/reactions` | Gallery interaction flow |
| DELETE | `/api/v1/reactions/:id` | Gallery interaction flow |
| PATCH | `/api/v1/reactions/:id` | Gallery interaction flow |
| GET | `/api/v1/sellUnitRequests` | Admin sell-unit review flow |
| POST | `/api/v1/sellUnitRequests` | Sell unit flow |
| DELETE | `/api/v1/sellUnitRequests/:id` | Sell unit flow |
| GET | `/api/v1/sellUnitRequests/:id` | Sell unit flow |
| PATCH | `/api/v1/sellUnitRequests/:id/review` | Admin sell-unit review flow |
| GET | `/api/v1/sellUnitRequests/me` | Sell unit flow |
| GET | `/api/v1/specialFurnitureRequests` | Admin special-furniture review flow |
| POST | `/api/v1/specialFurnitureRequests` | Special furniture flow |
| DELETE | `/api/v1/specialFurnitureRequests/:id` | Special furniture flow |
| GET | `/api/v1/specialFurnitureRequests/:id` | Special furniture flow |
| PATCH | `/api/v1/specialFurnitureRequests/:id/review` | Admin special-furniture review flow |
| GET | `/api/v1/specialFurnitureRequests/me` | Special furniture flow |
| GET | `/api/v1/unitOrderRequests` | Admin unit-order review flow |
| POST | `/api/v1/unitOrderRequests` | Unit order flow |
| DELETE | `/api/v1/unitOrderRequests/:id` | Unit order flow |
| GET | `/api/v1/unitOrderRequests/:id` | Unit order flow |
| PATCH | `/api/v1/unitOrderRequests/:id/review` | Admin unit-order review flow |
| GET | `/api/v1/unitOrderRequests/me` | Unit order flow |
| GET | `/api/v1/units` | Unit discovery flow |
| GET | `/api/v1/units/:id` | Unit discovery flow |
| GET | `/api/v1/users/me` | Profile flow |
| PATCH | `/api/v1/users/me` | Profile flow |
| POST | `/api/v1/users/me/change-password` | Profile flow |
| GET | `/health` | Health check |

## Unused Live Routes

| Method | Path | Source | Why It Is Unused |
|---|---|---|---|
| GET | `/api/v1/comments` | `src/modules/comment/comment.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| GET | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| PUT | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| GET | `/api/v1/comments/cursor` | `src/modules/comment/comment.routes.ts` | Cursor/list variant not referenced by the SRS flow document. |
| GET | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | Live route not referenced by the SRS client-flow document. |
| PATCH | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | Live route is available, but this specific variant is not part of the SRS client-flow coverage set. |
| PUT | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | Live route is available, but this specific variant is not part of the SRS client-flow coverage set. |
| GET | `/api/v1/finishes/cursor` | `src/modules/finish/finish.routes.ts` | Cursor/list variant not referenced by the SRS flow document. |
| GET | `/api/v1/furnitureItems/cursor` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Cursor/list variant not referenced by the SRS flow document. |
| GET | `/api/v1/galleryItems/cursor` | `src/modules/galleryItem/galleryItem.routes.ts` | Cursor/list variant not referenced by the SRS flow document. |
| GET | `/api/v1/locations` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| POST | `/api/v1/locations` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| DELETE | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| GET | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| PATCH | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| PUT | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | Admin setup/support endpoint used indirectly by catalog workflows, but not called explicitly in the SRS flow document. |
| GET | `/api/v1/reactions` | `src/modules/reaction/reaction.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| GET | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| PUT | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | Generated read/list variant not called explicitly in the documented interaction flows. |
| POST | `/api/v1/units` | `src/modules/unit/unit.routes.ts` | Live route not referenced by the SRS client-flow document. |
| DELETE | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | Live route is available, but this specific variant is not part of the SRS client-flow coverage set. |
| PATCH | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | Live route is available, but this specific variant is not part of the SRS client-flow coverage set. |
| PUT | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | Live route is available, but this specific variant is not part of the SRS client-flow coverage set. |
| GET | `/api/v1/units/cursor` | `src/modules/unit/unit.routes.ts` | Cursor/list variant not referenced by the SRS flow document. |

## All Live Routes

| Method | Path | Source | Covered By SRS |
|---|---|---|---|
| POST | `/api/v1/auth/forgot-password` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/login` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/logout` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/refresh` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/register` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/reset-password` | `src/modules/auth/auth.routes.ts` | Yes |
| POST | `/api/v1/auth/verify-otp` | `src/modules/auth/auth.routes.ts` | Yes |
| GET | `/api/v1/bookingRequests` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| POST | `/api/v1/bookingRequests` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| DELETE | `/api/v1/bookingRequests/:id` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| GET | `/api/v1/bookingRequests/:id` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| PATCH | `/api/v1/bookingRequests/:id/review` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| GET | `/api/v1/bookingRequests/me` | `src/modules/bookingRequest/bookingRequest.routes.ts` | Yes |
| GET | `/api/v1/comments` | `src/modules/comment/comment.routes.ts` | No |
| POST | `/api/v1/comments` | `src/modules/comment/comment.routes.ts` | Yes |
| DELETE | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | Yes |
| GET | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | No |
| PATCH | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | Yes |
| PUT | `/api/v1/comments/:id` | `src/modules/comment/comment.routes.ts` | No |
| GET | `/api/v1/comments/cursor` | `src/modules/comment/comment.routes.ts` | No |
| GET | `/api/v1/favorites` | `src/modules/favorite/favorite.routes.ts` | Yes |
| POST | `/api/v1/favorites` | `src/modules/favorite/favorite.routes.ts` | Yes |
| DELETE | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | Yes |
| GET | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | No |
| PATCH | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | No |
| PUT | `/api/v1/favorites/:id` | `src/modules/favorite/favorite.routes.ts` | No |
| GET | `/api/v1/finishes` | `src/modules/finish/finish.routes.ts` | Yes |
| POST | `/api/v1/finishes` | `src/modules/finish/finish.routes.ts` | Yes |
| DELETE | `/api/v1/finishes/:id` | `src/modules/finish/finish.routes.ts` | Yes |
| GET | `/api/v1/finishes/:id` | `src/modules/finish/finish.routes.ts` | Yes |
| PATCH | `/api/v1/finishes/:id` | `src/modules/finish/finish.routes.ts` | Yes |
| PUT | `/api/v1/finishes/:id` | `src/modules/finish/finish.routes.ts` | Yes |
| GET | `/api/v1/finishes/cursor` | `src/modules/finish/finish.routes.ts` | No |
| GET | `/api/v1/finishRequests` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| POST | `/api/v1/finishRequests` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| DELETE | `/api/v1/finishRequests/:id` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| GET | `/api/v1/finishRequests/:id` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| PATCH | `/api/v1/finishRequests/:id/review` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| GET | `/api/v1/finishRequests/me` | `src/modules/finishRequest/finishRequest.routes.ts` | Yes |
| GET | `/api/v1/furnitureBookings` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| POST | `/api/v1/furnitureBookings` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| DELETE | `/api/v1/furnitureBookings/:id` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| GET | `/api/v1/furnitureBookings/:id` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| PATCH | `/api/v1/furnitureBookings/:id/review` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| GET | `/api/v1/furnitureBookings/me` | `src/modules/furnitureBooking/furnitureBooking.routes.ts` | Yes |
| GET | `/api/v1/furnitureItems` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| POST | `/api/v1/furnitureItems` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| DELETE | `/api/v1/furnitureItems/:id` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| GET | `/api/v1/furnitureItems/:id` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| PATCH | `/api/v1/furnitureItems/:id` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| PUT | `/api/v1/furnitureItems/:id` | `src/modules/furnitureItem/furnitureItem.routes.ts` | Yes |
| GET | `/api/v1/furnitureItems/cursor` | `src/modules/furnitureItem/furnitureItem.routes.ts` | No |
| GET | `/api/v1/galleryItems` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| POST | `/api/v1/galleryItems` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| DELETE | `/api/v1/galleryItems/:id` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| GET | `/api/v1/galleryItems/:id` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| PATCH | `/api/v1/galleryItems/:id` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| PUT | `/api/v1/galleryItems/:id` | `src/modules/galleryItem/galleryItem.routes.ts` | Yes |
| GET | `/api/v1/galleryItems/cursor` | `src/modules/galleryItem/galleryItem.routes.ts` | No |
| GET | `/api/v1/locations` | `src/modules/location/location.routes.ts` | No |
| POST | `/api/v1/locations` | `src/modules/location/location.routes.ts` | No |
| DELETE | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | No |
| GET | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | No |
| PATCH | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | No |
| PUT | `/api/v1/locations/:id` | `src/modules/location/location.routes.ts` | No |
| GET | `/api/v1/reactions` | `src/modules/reaction/reaction.routes.ts` | No |
| POST | `/api/v1/reactions` | `src/modules/reaction/reaction.routes.ts` | Yes |
| DELETE | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | Yes |
| GET | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | No |
| PATCH | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | Yes |
| PUT | `/api/v1/reactions/:id` | `src/modules/reaction/reaction.routes.ts` | No |
| GET | `/api/v1/sellUnitRequests` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| POST | `/api/v1/sellUnitRequests` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| DELETE | `/api/v1/sellUnitRequests/:id` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| GET | `/api/v1/sellUnitRequests/:id` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| PATCH | `/api/v1/sellUnitRequests/:id/review` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| GET | `/api/v1/sellUnitRequests/me` | `src/modules/sellUnitRequest/sellUnitRequest.routes.ts` | Yes |
| GET | `/api/v1/specialFurnitureRequests` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| POST | `/api/v1/specialFurnitureRequests` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| DELETE | `/api/v1/specialFurnitureRequests/:id` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| GET | `/api/v1/specialFurnitureRequests/:id` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| PATCH | `/api/v1/specialFurnitureRequests/:id/review` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| GET | `/api/v1/specialFurnitureRequests/me` | `src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts` | Yes |
| GET | `/api/v1/unitOrderRequests` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| POST | `/api/v1/unitOrderRequests` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| DELETE | `/api/v1/unitOrderRequests/:id` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| GET | `/api/v1/unitOrderRequests/:id` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| PATCH | `/api/v1/unitOrderRequests/:id/review` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| GET | `/api/v1/unitOrderRequests/me` | `src/modules/unitOrderRequest/unitOrderRequest.routes.ts` | Yes |
| GET | `/api/v1/units` | `src/modules/unit/unit.routes.ts` | Yes |
| POST | `/api/v1/units` | `src/modules/unit/unit.routes.ts` | No |
| DELETE | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | No |
| GET | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | Yes |
| PATCH | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | No |
| PUT | `/api/v1/units/:id` | `src/modules/unit/unit.routes.ts` | No |
| GET | `/api/v1/units/cursor` | `src/modules/unit/unit.routes.ts` | No |
| GET | `/api/v1/users/me` | `src/modules/user/user.routes.ts` | Yes |
| PATCH | `/api/v1/users/me` | `src/modules/user/user.routes.ts` | Yes |
| POST | `/api/v1/users/me/change-password` | `src/modules/user/user.routes.ts` | Yes |
| GET | `/health` | `src/app.ts` | Yes |

