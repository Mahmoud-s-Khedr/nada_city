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
1. Broken role authorization likely blocks normal protected-route access.
   Evidence: [auth.middleware.ts](/home/mk/Projects/freelance/mohand/nada_city/src/middlewares/auth.middleware.ts:60) compares `req.user.role` directly, while protected routes pass quoted literals such as `authorize('"ADMIN"')` and `authorize('"USER"', '"ADMIN"')` in [bookingRequest.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.routes.ts:19). Login tokens are issued with unquoted enum values in [auth.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/auth/auth.routes.ts:52), so a real token with role `ADMIN` or `USER` will not match `"ADMIN"` or `"USER"`.
2. User/profile endpoints are public and not ownership-restricted.
   Evidence: [user.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/user/user.routes.ts:13) exposes list/get/create/update/delete without `authenticate` or `authorize`. This violates the SRS profile flow and creates direct security/privacy risk.
3. Request workflows expose admin-managed fields and nested entity creation to end users.
   Evidence: request DTOs allow client-supplied `status` and `adminNote` and nested `user`/resource creation, for example [bookingRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.dto.ts:68), [sellUnitRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/sellUnitRequest/sellUnitRequest.dto.ts:44), [finishRequest.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/finishRequest/finishRequest.dto.ts:63), and [furnitureBooking.dto.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/furnitureBooking/furnitureBooking.dto.ts:59). Users can shape approval state and create linked users/items instead of acting as the authenticated principal on existing records.
4. Most SRS workflows are implemented only as generic CRUD, without workflow rules.
   Evidence: controllers delegate directly to repositories with generic `create/update/delete` and query-builder filtering, for example [bookingRequest.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/bookingRequest/bookingRequest.controller.ts:183), [unit.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unit/unit.controller.ts:132), and [galleryItem.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/galleryItem/galleryItem.controller.ts:129). There are no explicit approval endpoints, no ownership checks, and no status-transition rules.
5. OpenAPI documentation is incomplete relative to live routes.
   Evidence: `src/app.ts` mounts cursor endpoints for several modules, but `openapi.json` contains no `/cursor` paths. This means the published contract does not fully describe the API surface.

## Requirement Matrix
| Domain | SRS Requirement | Status | Backend Evidence | Gap / Notes |
|---|---|---|---|---|
| Auth | Registration with OTP send and verification before account creation | Partially implemented | `User`, `OtpToken` models exist in [schema.prisma](/home/mk/Projects/freelance/mohand/nada_city/prisma/schema.prisma:66), and generic CRUD exists for `/users` and `/otpTokens` in [app.ts](/home/mk/Projects/freelance/mohand/nada_city/src/app.ts:55) | No dedicated register/verify flow in `auth.routes.ts`; no OTP send/consume logic; public user creation bypasses verification |
| Auth | Login | Partially implemented | `/api/v1/auth/login` exists in [auth.routes.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/auth/auth.routes.ts:37) | No explicit email-format validation, empty-field checks, or `isVerified` enforcement |
| Auth | Forgot password | Partially implemented | `PasswordResetToken` model and CRUD routes exist | No dedicated forgot-password / reset-password flow in `auth.routes.ts`; generic CRUD is not the SRS workflow |
| Profile | Show user details | Partially implemented | `/api/v1/users/:id` exists | Endpoint is public and not tied to current authenticated user |
| Profile | Edit user details | Partially implemented | `/api/v1/users/:id` `PUT/PATCH` exist | Public write access; no ownership restriction; allows role and `isVerified` mutation through DTO |
| Profile | Change password with old-password verification | Not implemented | Users can patch `password` through generic user update | No old-password verification flow; no dedicated password-change endpoint |
| Gallery | Admin manage items | Partially implemented | Gallery CRUD plus `GalleryItem` model exist | Route auth likely broken by quoted roles; workflow otherwise matches admin CRUD shape |
| Gallery | Users list items | Implemented | Public `GET /api/v1/galleryItems`; repository excludes soft-deleted rows in [galleryItem.repository.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/galleryItem/galleryItem.repository.ts:58) | Backend support exists |
| Gallery | Filter by type, search by title/keywords, sort by recent date asc/desc | Partially implemented | Query builder plus controller config support `type`, `search`, and `createdAt` in [galleryItem.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/galleryItem/galleryItem.controller.ts:10) | Works as generic query params, but not expressed as SRS-specific API contract; default sort is `id`, not recent date |
| Gallery | React and comment on item | Partially implemented | `Comment` and `Reaction` models/routes exist | Protected routes likely blocked by quoted roles; no ownership rules on update/delete |
| Locations | Admin manage locations | Partially implemented | Location model and CRUD routes exist | Auth bug on admin routes; otherwise CRUD present |
| Units | Admin manage units | Partially implemented | Unit model, DTOs, and CRUD routes exist | Auth bug on admin routes; no workflow around accepted sell-request conversion beyond raw relation field |
| Units | Users list available units | Partially implemented | Public list exists; `availability` filter supported in [unit.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unit/unit.controller.ts:10) | Endpoint does not default to `availability=AVAILABLE`; users can see all non-deleted units unless they filter manually |
| Units | Search/filter/sort units by keyword, price, location, date | Implemented | Searchable fields and allowed filters include `keywords`, `price`, `locationId`, and `createdAt` in [unit.controller.ts](/home/mk/Projects/freelance/mohand/nada_city/src/modules/unit/unit.controller.ts:10) | Implemented as generic query params |
| Booking | Book unit | Partially implemented | `BookingRequest` model/routes/DTOs exist | Request can create nested user/unit and supply `status`/`adminNote`; not bound to authenticated user and existing unit |
| Booking | User booking history and delete own request | Partially implemented | Generic list/delete exists | No `/me` or ownership restriction; history relies on open filtering by `userId` |
| Booking | Admin approve/reject booking | Partially implemented | `status` field exists on model | No admin-only approval endpoint; any allowed writer can set status through generic update |
| Sell Unit | User submits sell-unit request | Partially implemented | `SellUnitRequest` model/routes/DTOs exist | Same generic CRUD issues: user nested creation and client-controlled status/adminNote |
| Sell Unit | User selling history | Partially implemented | Generic list exists | No ownership-scoped history endpoint |
| Sell Unit | Admin approve/reject/edit; accepted request adds unit | Partially implemented | `acceptedSellRequestId` / `acceptedUnit` relation exists in schema | No workflow handler that creates a unit on acceptance; only raw relation support exists |
| Order Unit | User creates order request | Partially implemented | `UnitOrderRequest` model/routes exist | Generic CRUD only; no ownership scoping |
| Order Unit | User order history | Partially implemented | Generic list exists | No dedicated current-user history API |
| Order Unit | Admin marks request as available | Partially implemented | `RequestStatus.AVAILABLE` exists in schema | No admin-only transition endpoint; status is client-writeable |
| Finishes | Admin manage finishes | Partially implemented | Finish model/routes/repository exist | Auth bug on admin routes; otherwise CRUD present |
| Finishes | User list finishes | Implemented | Public `GET /api/v1/finishes`; repository hides soft-deleted rows | Backend support exists |
| Finishes | User sends finish request | Partially implemented | `FinishRequest` model/routes/DTOs exist | Request schema allows nested finish/user creation and client status/adminNote |
| Finishes | Admin approve/reject finish request | Partially implemented | `status` field exists | No explicit admin approval workflow |
| Furniture | Admin manage furniture items | Partially implemented | Furniture item model/routes exist | Auth bug on admin routes |
| Furniture | User list furniture items | Implemented | Public `GET /api/v1/furnitureItems`; repository hides soft-deleted rows | Backend support exists |
| Furniture | User books furniture | Partially implemented | `FurnitureBooking` model/routes/DTOs exist | Generic CRUD; nested furniture/user creation and client-controlled status/adminNote |
| Furniture | Admin approve/reject furniture booking | Partially implemented | `status` field exists | No explicit admin-only workflow |
| Furniture | User special furniture request | Partially implemented | `SpecialFurnitureRequest` model/routes/DTOs exist | Same generic CRUD issues; no ownership-specific access |
| Cross-cutting | Favorites | Implemented but extra to SRS | `Favorite` model/routes exist | Useful extra feature not called out in SRS |
| Cross-cutting | WhatsApp open tracking | Unclear / extra | `WhatsappOpenEvent` model/routes exist | Not clearly specified in reviewed SRS pages; likely an extra analytics feature |

## Code-Quality and Compliance Notes
- Soft delete is implemented for content catalogs such as gallery items, units, locations, finishes, and furniture items through `deletedAt`, but request-style modules still hard-delete records.
- Query/search/filter support is broad because of the shared query builder, but business constraints are weak because the same builder is exposed on public list endpoints.
- Tests are mostly generated CRUD-path tests with mocked Prisma delegates. They verify transport shape more than business policy, and they currently mask the quoted-role bug by minting tokens with roles like `"USER"` and `"ADMIN"` instead of enum values.
- The repository has more backend entities than the SRS explicitly requires, but that does not compensate for missing workflow-specific endpoints and authorization rules.

## Recommended Next Steps
1. Fix role authorization literals across all protected routes and update tests to use real enum values.
2. Replace public generic `/users` CRUD with explicit auth/profile endpoints: register, verify OTP, forgot password, reset password, get me, update me, change password.
3. Split user-facing request creation from admin approval/update flows. User DTOs should not accept `status`, `adminNote`, `role`, `isVerified`, or nested privileged object creation.
4. Add ownership enforcement for profile, requests, comments, reactions, and favorites.
5. Add dedicated approval/status-transition handlers for booking, sell-unit, unit-order, finish, and furniture workflows.
6. Regenerate or correct `openapi.json` so it matches live routes, including cursor endpoints if they are intended to be public.
