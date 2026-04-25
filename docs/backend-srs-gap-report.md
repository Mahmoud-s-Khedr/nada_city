# NADA City Backend vs SRS Gap Report

## Implementation Update (2026-04-25)
- Completed in code: role normalization in authorization, OTP registration and verification, forgot/reset password flows, `/api/v1/users/me`, `/api/v1/users/me/change-password`, user-owned comment/reaction/favorite writes, request workflow split for booking/sell-unit/unit-order/finish/furniture/special-furniture requests, unit default availability filter, recent-first defaults for gallery/finish/furniture catalogs, sell-request acceptance creating a unit, and replacement workflow tests.
- Still incomplete: `openapi.json` and this report have not been fully regenerated line-by-line against the new route surface, so treat the requirement matrix below as historical pre-remediation analysis except where superseded by this update section.

## Scope
This review compares the backend in this repository against the requirements in `docs/NADA city SRS.pdf`.

- Scope: backend/API only
- Out of scope: frontend screens, UX copy, admin dashboard UI, mobile/web presentation
- Evidence sources: `prisma/schema.prisma`, `src/app.ts`, module routes/controllers/DTOs/repositories, `openapi.json`, and existing tests

## Baseline
- Repo shape: Express + TypeScript + Prisma REST API with generated CRUD modules
- Static coverage: auth, users, gallery, locations, units, booking requests, sell-unit requests, unit-order requests, finishes, finish requests, furniture items, furniture bookings, special furniture requests, favorites, and WhatsApp open events
- Test baseline: `pnpm test` could not run because dependencies are not installed in this workspace. It fails at `prisma generate` with `prisma: command not found`.

## High-Severity Findings
1. Resolved: role authorization now normalizes token roles before comparison.
   Evidence: [auth.middleware.ts](/home/mk/Projects/freelance/mohand/nada_city/src/middlewares/auth.middleware.ts:1) now strips quoted role literals and compares normalized values, so real `ADMIN` and `USER` JWT claims work across protected routes.
2. Resolved: profile endpoints are now authenticated and ownership-scoped.
   Evidence: [user.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/user/user.routes.ts:1) exposes `/me`, `PATCH /me`, and `/me/change-password` instead of public generic user CRUD.
3. Resolved: user-facing request inputs no longer accept admin-managed fields or nested privileged object creation.
   Evidence: the public request schemas in [bookingRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.dto.ts:1), [sellUnitRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/sellUnitRequest/sellUnitRequest.dto.ts:1), [finishRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/finishRequest/finishRequest.dto.ts:1), and [furnitureBooking.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/furnitureBooking/furnitureBooking.dto.ts:1) are strict and exclude `status`, `adminNote`, and nested `user` creation.
4. Resolved: request workflows now use explicit create/history/cancel/review endpoints.
   Evidence: request route modules implement ownership checks, admin review handlers, and status-transition rules directly in the route layer, for example [bookingRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.routes.ts:1) and [sellUnitRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/sellUnitRequest/sellUnitRequest.routes.ts:1).
5. Still open: OpenAPI documentation is incomplete relative to live routes.
   Evidence: `openapi.json` has not yet been regenerated to match the new workflow routes and the older cursor route coverage is still incomplete.

## Requirement Matrix
| Domain | SRS Requirement | Status | Backend Evidence | Gap / Notes |
|---|---|---|---|---|
| Auth | Registration with OTP send and verification before account creation | Implemented | `/api/v1/auth/register` and `/api/v1/auth/verify-otp` now issue and consume OTPs in [auth.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/auth/auth.routes.ts:1) | Delivery uses a provider abstraction with the current dev logger-backed implementation |
| Auth | Login | Implemented | `/api/v1/auth/login` validates email input and blocks unverified users in [auth.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/auth/auth.routes.ts:1) | Login/refresh/logout flow is now aligned with verified-account policy |
| Auth | Forgot password | Implemented | `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password` are implemented in [auth.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/auth/auth.routes.ts:1) | Delivery also uses the provider abstraction |
| Profile | Show user details | Implemented | `/api/v1/users/me` exists in [user.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/user/user.routes.ts:1) | Authenticated current-user profile only |
| Profile | Edit user details | Implemented | `PATCH /api/v1/users/me` exists in [user.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/user/user.routes.ts:1) | Restricted to `name`, `phone`, and `address` |
| Profile | Change password with old-password verification | Implemented | `POST /api/v1/users/me/change-password` verifies the old password in [user.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/user/user.routes.ts:1) | Enforces password confirmation and strength checks |
| Gallery | Admin manage items | Implemented | Admin gallery writes remain in place and role checks are normalized by [auth.middleware.ts](/home/mk/Projects/freelance/mohand/nada_city/src/middlewares/auth.middleware.ts:1) | CRUD shape remains valid for admin catalog management |
| Gallery | Users list items | Implemented | Public `GET /api/v1/galleryItems`; repository excludes soft-deleted rows in [galleryItem.repository.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/galleryItem/galleryItem.repository.ts:58) | Backend support exists |
| Gallery | Filter by type, search by title/keywords, sort by recent date asc/desc | Implemented | Query builder plus `createdAt` default sort are configured in [galleryItem.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/galleryItem/galleryItem.controller.ts:1) | Still expressed as generic query params rather than a custom contract |
| Gallery | React and comment on item | Implemented | Comment/reaction create and ownership checks are enforced in the comment and reaction modules | User-owned writes and deletes are now enforced |
| Locations | Admin manage locations | Implemented | Location model and CRUD routes exist | Role normalization fixed the admin route authorization issue |
| Units | Admin manage units | Implemented | Unit model, DTOs, and CRUD routes exist | Sell-unit acceptance now also creates units through the sell request workflow |
| Units | Users list available units | Implemented | Public unit listing now defaults `availability=AVAILABLE` in [unit.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unit/unit.controller.ts:1) | Admin catalog management remains separate |
| Units | Search/filter/sort units by keyword, price, location, date | Implemented | Searchable fields and allowed filters include `keywords`, `price`, `locationId`, and `createdAt` in [unit.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unit/unit.controller.ts:10) | Implemented as generic query params |
| Booking | Book unit | Implemented | `POST /api/v1/bookingRequests` requires an existing available unit in [bookingRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.routes.ts:1) | User id is bound from the authenticated token |
| Booking | User booking history and delete own request | Implemented | `GET /api/v1/bookingRequests/me` and pending-only cancel are implemented in [bookingRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.routes.ts:1) | Delete is modeled as cancel to `CANCELLED` |
| Booking | Admin approve/reject booking | Implemented | `PATCH /api/v1/bookingRequests/:id/review` exists in [bookingRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.routes.ts:1) | Admin-only review endpoint |
| Sell Unit | User submits sell-unit request | Implemented | `POST /api/v1/sellUnitRequests` accepts only user-controlled request fields | User id is bound from auth |
| Sell Unit | User selling history | Implemented | `GET /api/v1/sellUnitRequests/me` exists in [sellUnitRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/sellUnitRequest/sellUnitRequest.routes.ts:1) | Ownership-scoped |
| Sell Unit | Admin approve/reject/edit; accepted request adds unit | Implemented | `PATCH /api/v1/sellUnitRequests/:id/review` edits/reviews and creates a `Unit` on acceptance in [sellUnitRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/sellUnitRequest/sellUnitRequest.routes.ts:1) | Transactional accept flow |
| Order Unit | User creates order request | Implemented | `POST /api/v1/unitOrderRequests` exists in [unitOrderRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unitOrderRequest/unitOrderRequest.routes.ts:1) | User id is auth-bound |
| Order Unit | User order history | Implemented | `GET /api/v1/unitOrderRequests/me` exists in [unitOrderRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unitOrderRequest/unitOrderRequest.routes.ts:1) | Ownership-scoped |
| Order Unit | Admin marks request as available | Implemented | `PATCH /api/v1/unitOrderRequests/:id/review` supports `AVAILABLE` in [unitOrderRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unitOrderRequest/unitOrderRequest.routes.ts:1) | Admin-only review endpoint |
| Finishes | Admin manage finishes | Implemented | Finish model/routes/repository exist | Role normalization fixed the admin route authorization issue |
| Finishes | User list finishes | Implemented | Public `GET /api/v1/finishes`; repository hides soft-deleted rows | Backend support exists |
| Finishes | User sends finish request | Implemented | `POST /api/v1/finishRequests` and `GET /api/v1/finishRequests/me` exist in [finishRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/finishRequest/finishRequest.routes.ts:1) | Uses strict user-facing request schema |
| Finishes | Admin approve/reject finish request | Implemented | `PATCH /api/v1/finishRequests/:id/review` exists in [finishRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/finishRequest/finishRequest.routes.ts:1) | Admin-only review endpoint |
| Furniture | Admin manage furniture items | Implemented | Furniture item model/routes exist | Role normalization fixed the admin route authorization issue |
| Furniture | User list furniture items | Implemented | Public `GET /api/v1/furnitureItems`; repository hides soft-deleted rows | Backend support exists |
| Furniture | User books furniture | Implemented | `POST /api/v1/furnitureBookings` and `GET /api/v1/furnitureBookings/me` exist in [furnitureBooking.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/furnitureBooking/furnitureBooking.routes.ts:1) | Requires an existing furniture item |
| Furniture | Admin approve/reject furniture booking | Implemented | `PATCH /api/v1/furnitureBookings/:id/review` exists in [furnitureBooking.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/furnitureBooking/furnitureBooking.routes.ts:1) | Admin-only review endpoint |
| Furniture | User special furniture request | Implemented | `POST /api/v1/specialFurnitureRequests` and `GET /api/v1/specialFurnitureRequests/me` exist in [specialFurnitureRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/specialFurnitureRequest/specialFurnitureRequest.routes.ts:1) | Ownership-scoped with admin review |
| Cross-cutting | Favorites | Implemented but extra to SRS | `Favorite` model/routes exist | Useful extra feature not called out in SRS |
| Cross-cutting | WhatsApp open tracking | Unclear / extra | `WhatsappOpenEvent` model/routes exist | Not clearly specified in reviewed SRS pages; likely an extra analytics feature |

## Code-Quality and Compliance Notes
- Soft delete is implemented for content catalogs such as gallery items, units, locations, finishes, and furniture items through `deletedAt`, but request-style modules still hard-delete records.
- Query/search/filter support is broad because of the shared query builder, but business constraints are weak because the same builder is exposed on public list endpoints.
- Tests are mostly generated CRUD-path tests with mocked Prisma delegates. They verify transport shape more than business policy, and they currently mask the quoted-role bug by minting tokens with roles like `"USER"` and `"ADMIN"` instead of enum values.
- The repository has more backend entities than the SRS explicitly requires, but that does not compensate for missing workflow-specific endpoints and authorization rules.

## Recommended Next Steps
1. Regenerate `openapi.json` so it matches the implemented workflow routes and removes stale generated CRUD surface descriptions.
2. Refresh this report again after the OpenAPI regeneration so the remaining documentation mismatch is fully closed.
