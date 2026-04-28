# NADA City API User Flows

This document converts the SRS in `docs/NADA city SRS.pdf` into ordered API usage flows based on the live backend routes. Route files and `docs/backend-srs-gap-report.md` take precedence over `openapi.json` where they differ.

Base path: `/api/v1`

## Global Rules

- Public catalog endpoints can be used without authentication.
- Authenticated flows require a successful `POST /auth/login` first, except `POST /auth/logout`, which only requires a valid `refreshToken` in the request body.
- New users must complete OTP verification before login.
- Admin-only endpoints must not be called by normal users.
- Request cancellation is only allowed while the request status is `PENDING`.
- Review endpoints are only allowed while the request status is `PENDING`.
- Ownership-scoped endpoints only allow the creator to view, update, or delete their own records unless the caller is an admin.

## 1. Registration, Verification, Session, and Logout

**Goal**  
Create a verified account, open a session, renew it, and end it.

**Actors**  
User

**Preconditions**

- The email is not already tied to a verified account.
- The password is strong enough for backend validation.

**Flow**

1. `POST /auth/register`
   Body: `name`, `email`, `password`, optional `phone`, optional `address`
   Result: backend stores or refreshes the unverified user and sends an OTP.
2. `POST /auth/verify-otp`
   Body: `email`, `code`
   Result: backend marks the user as verified.
3. `POST /auth/login`
   Body: `email`, `password`
   Result: backend returns `accessToken` and `refreshToken`.
4. Use the `accessToken` on authenticated endpoints such as `/users/me`, `/bookingRequests`, `/finishRequests`, and similar workflow routes.
5. `POST /auth/refresh`
   Body: `refreshToken`
   Result: backend invalidates the old refresh token and returns a new access/refresh pair.
6. `POST /auth/logout`
   Body: `refreshToken`
   Result: backend deletes that refresh token and ends the session tied to it.

**Postconditions**

- The account is verified after step 2.
- The user is authenticated after step 3.
- The session tied to the provided refresh token is invalidated after step 6.

**Invalid Sequences**

- Do not call `POST /auth/login` before `POST /auth/verify-otp` for a newly registered account.
- Do not call `POST /auth/logout` before obtaining a refresh token from login or refresh.
- Do not call `POST /auth/refresh` with an expired or already-used refresh token.

## 2. Forgot and Reset Password

**Goal**  
Recover access without an active session.

**Actors**  
User

**Preconditions**

- The account exists and is already verified.

**Flow**

1. `POST /auth/forgot-password`
   Body: `email`
   Result: backend creates a reset token for verified users and sends it through the token delivery provider.
2. `POST /auth/reset-password`
   Body: `token`, `password`, `confirmPassword`
   Result: backend validates the token, checks password rules, marks the token consumed, and updates the password.
3. `POST /auth/login`
   Body: `email`, new `password`
   Result: backend returns `accessToken` and `refreshToken`.

**Postconditions**

- The old password is replaced.
- The reset token cannot be reused.

**Invalid Sequences**

- Do not call `POST /auth/reset-password` before receiving a valid reset token.
- Do not reuse a consumed or expired reset token.
- Do not attempt login with the new password before reset succeeds.

## 3. Profile and Password Management

**Goal**  
Read and maintain the authenticated user's profile.

**Actors**  
User

**Preconditions**

- The user is logged in and sends a valid `Authorization: Bearer <accessToken>` header.

**Flow**

1. `POST /auth/login`
2. `GET /users/me`
   Result: returns the current user's `id`, `name`, `email`, `phone`, `address`, `rate`, `role`, and verification state.
3. `PATCH /users/me`
   Body: any of `name`, `phone`, `address`
   Result: updates those profile fields.
4. `POST /users/me/change-password`
   Body: `oldPassword`, `newPassword`, `confirmPassword`
   Result: backend verifies the old password and updates the password.

**Postconditions**

- Profile fields are updated after step 3.
- The password is changed after step 4.

**Invalid Sequences**

- Do not call `/users/me` endpoints without logging in first.
- Do not call `POST /users/me/change-password` with the wrong `oldPassword`.
- Do not send mismatched `newPassword` and `confirmPassword`.

## 4. Gallery Browsing, Search, Reactions, Comments, and Favorites

**Goal**  
Browse gallery content publicly, then interact with items after login.

**Actors**  
User, Admin

**Preconditions**

- No auth is required for gallery reads.
- Login is required before comment, reaction, or favorite writes.

**User Flow**

1. `GET /galleryItems`
   Optional query behavior:
   - filter by fields such as `type`
   - search by `title`, `description`, `details`, or `keywords`
   - sort by `createdAt` ascending or descending
   - include `comments`, `reactions`, or `favorites`
2. Optional: `GET /galleryItems/:id`
   Result: reads a single gallery item.
3. `POST /auth/login`
4. Optional: `POST /comments`
   Body: `body`, `galleryItemId`
5. Optional: `PATCH /comments/:id` or `DELETE /comments/:id`
   Result: allowed only for the owner or an admin.
6. Optional: `POST /reactions`
   Body: `galleryItemId`, optional `type` (`LIKE`, `LOVE`, `WOW`)
7. Optional: `PATCH /reactions/:id` or `DELETE /reactions/:id`
   Result: allowed only for the owner or an admin.
8. Optional: `POST /favorites`
   Body: `type` plus exactly one target id from `galleryItemId`, `unitId`, `finishId`, or `furnitureItemId`
9. Optional: `GET /favorites?filter[type]=...`
   Result: lists favorites and supports type filtering.
10. Optional: `DELETE /favorites/:id`

**Admin Catalog Flow**

1. `POST /auth/login` as admin
2. `POST /galleryItems`
3. `PUT /galleryItems/:id` or `PATCH /galleryItems/:id`
4. `DELETE /galleryItems/:id`

**Postconditions**

- Public users can read gallery content without a session.
- Logged-in users can create their own comments, reactions, and favorites.
- Admins can manage gallery items.

**Invalid Sequences**

- Do not create comments, reactions, or favorites before login.
- Do not update or delete another user's comment, reaction, or favorite unless logged in as admin.
- Do not send more than one favorite target id in a single favorite create request.

## 5. Unit Discovery and Booking Request

**Goal**  
Find available units, submit a booking request, manage the user's own request, and let admins review it.

**Actors**  
User, Admin

**Preconditions**

- Public unit listing defaults to `availability=AVAILABLE`.
- Booking requires login.
- Booking requires an existing unit whose availability is still `AVAILABLE`.

**User Flow**

1. `GET /units`
   Optional query behavior:
   - search by `title`, `description`, or `keywords`
   - filter by `price`, `locationId`, `type`, `createdAt`, and similar allowed fields
   - sort by `price` or `createdAt`
   - include related data such as `location`
2. Optional: `GET /units/:id`
3. `POST /auth/login`
4. `POST /bookingRequests`
   Body: `unitId`, `name`, `phone`, `address`, optional `details`
5. `GET /bookingRequests/me`
   Result: lists the authenticated user's booking history.
6. Optional: `GET /bookingRequests/:id`
   Result: allowed for the owner or an admin.
7. Optional: `DELETE /bookingRequests/:id`
   Result: cancels the request only if its status is `PENDING`.

**Admin Review Flow**

1. `POST /auth/login` as admin
2. `GET /bookingRequests`
   Optional filters: `status`, `userId`, `unitId`
3. `PATCH /bookingRequests/:id/review`
   Body: `status`, optional `adminNote`
   Result: sets the request to `ACCEPTED` or `REJECTED`.

**Postconditions**

- A booking request exists after user step 4.
- The user can track it through `/bookingRequests/me`.
- Admin review moves it out of `PENDING`.

**Invalid Sequences**

- Do not create a booking request before login.
- Do not create a booking request for a deleted, missing, or unavailable unit.
- Do not cancel or review a request after it is no longer `PENDING`.
- Do not call `/bookingRequests/:id/review` as a non-admin user.

## 6. Sell Your Unit

**Goal**  
Submit a unit-for-sale request, track it, optionally cancel it, and allow admin approval to create a real unit record.

**Actors**  
User, Admin

**Preconditions**

- The user is logged in before submitting a sell request.

**User Flow**

1. `POST /auth/login`
2. `POST /sellUnitRequests`
   Body: public sell-request fields from the request schema, including unit details such as title, description, price, type, address, location linkage, media, and details
3. `GET /sellUnitRequests/me`
4. Optional: `GET /sellUnitRequests/:id`
5. Optional: `DELETE /sellUnitRequests/:id`
   Result: cancels the request only if it is `PENDING`.

**Admin Review Flow**

1. `POST /auth/login` as admin
2. `GET /sellUnitRequests`
   Optional filters: `status`, `userId`
3. `PATCH /sellUnitRequests/:id/review`
   Body: `status`, optional `adminNote`, and optional editable unit fields
4. If the admin sets `status=ACCEPTED`, include `locationId` either in the review body or already on the request.
   Result: backend updates the sell request and creates a new `Unit` linked through `acceptedSellRequestId`.

**Postconditions**

- The sell request is visible in the user's history after submission.
- An accepted sell request creates an available unit in the catalog.

**Invalid Sequences**

- Do not submit a sell request before login.
- Do not cancel or review a sell request after it leaves `PENDING`.
- Do not accept a sell request without a `locationId`.
- Do not call `/sellUnitRequests/:id/review` as a non-admin user.

## 7. Order Your Unit

**Goal**  
Let a user describe a desired unit and let admins mark whether it became available.

**Actors**  
User, Admin

**Preconditions**

- The user is logged in.

**User Flow**

1. `POST /auth/login`
2. `POST /unitOrderRequests`
   Body: public order-request fields from the request schema
3. `GET /unitOrderRequests/me`
4. Optional: `GET /unitOrderRequests/:id`
5. Optional: `DELETE /unitOrderRequests/:id`
   Result: cancels the request only if it is `PENDING`.

**Admin Review Flow**

1. `POST /auth/login` as admin
2. `GET /unitOrderRequests`
   Optional filters: `status`, `userId`
3. `PATCH /unitOrderRequests/:id/review`
   Body: `status`, optional `adminNote`
   Result: marks the request as reviewed, including the `AVAILABLE` branch required by the SRS workflow.

**Postconditions**

- The order request appears in the user's history.
- Admin review changes the status from `PENDING`.

**Invalid Sequences**

- Do not submit an order request before login.
- Do not cancel or review an order request after it leaves `PENDING`.
- Do not call `/unitOrderRequests/:id/review` as a non-admin user.

## 8. Finishes and Finish Requests

**Goal**  
Browse finishes, request a finish service, and review the request through admin workflow.

**Actors**  
User, Admin

**Preconditions**

- Finish catalog reads are public.
- Finish requests require login.
- If `finishId` is sent in the request body, it must reference an existing non-deleted finish.

**User Flow**

1. `GET /finishes`
2. Optional: `GET /finishes/:id`
3. `POST /auth/login`
4. `POST /finishRequests`
   Body: request data including `address`, `requestedAt`, and either a specific `finishId` or free-form request details supported by the schema
5. `GET /finishRequests/me`
6. Optional: `GET /finishRequests/:id`
7. Optional: `DELETE /finishRequests/:id`
   Result: cancels the request only if it is `PENDING`.

**Admin Catalog and Review Flow**

1. `POST /auth/login` as admin
2. Optional catalog management:
   - `POST /finishes`
   - `PUT /finishes/:id` or `PATCH /finishes/:id`
   - `DELETE /finishes/:id`
3. `GET /finishRequests`
   Optional filters: `status`, `userId`, `finishId`
4. `PATCH /finishRequests/:id/review`
   Body: `status`, optional `adminNote`

**Postconditions**

- Users can browse finish options without authentication.
- Logged-in users can create and track finish requests.
- Admin review changes the request status from `PENDING`.

**Invalid Sequences**

- Do not submit a finish request before login.
- Do not send a nonexistent or deleted `finishId`.
- Do not cancel or review a finish request after it leaves `PENDING`.
- Do not call admin finish catalog or review endpoints as a non-admin user.

## 9. Furniture Catalog and Furniture Booking

**Goal**  
Browse furniture, place a booking request, and let admins review it.

**Actors**  
User, Admin

**Preconditions**

- Furniture catalog reads are public.
- Furniture booking requires login.
- Booking requires an existing non-deleted furniture item.

**User Flow**

1. `GET /furnitureItems`
2. Optional: `GET /furnitureItems/:id`
3. `POST /auth/login`
4. `POST /furnitureBookings`
   Body: `furnitureItemId`, `name`, `phone`, `address`, optional request details defined by the schema
5. `GET /furnitureBookings/me`
6. Optional: `GET /furnitureBookings/:id`
7. Optional: `DELETE /furnitureBookings/:id`
   Result: cancels the booking only if it is `PENDING`.

**Admin Catalog and Review Flow**

1. `POST /auth/login` as admin
2. Optional catalog management:
   - `POST /furnitureItems`
   - `PUT /furnitureItems/:id` or `PATCH /furnitureItems/:id`
   - `DELETE /furnitureItems/:id`
3. `GET /furnitureBookings`
   Optional filters: `status`, `userId`, `furnitureItemId`
4. `PATCH /furnitureBookings/:id/review`
   Body: `status`, optional `adminNote`

**Postconditions**

- Users can browse furniture publicly.
- Logged-in users can create and track furniture bookings.
- Admin review changes the booking status from `PENDING`.

**Invalid Sequences**

- Do not submit a furniture booking before login.
- Do not book a missing or deleted furniture item.
- Do not cancel or review a furniture booking after it leaves `PENDING`.
- Do not call admin furniture endpoints as a non-admin user.

## 10. Special Furniture Request

**Goal**  
Submit a custom furniture request and let admins review it.

**Actors**  
User, Admin

**Preconditions**

- The user is logged in.

**User Flow**

1. `POST /auth/login`
2. `POST /specialFurnitureRequests`
   Body: request fields such as `name`, `phone`, and `details`
3. `GET /specialFurnitureRequests/me`
4. Optional: `GET /specialFurnitureRequests/:id`
5. Optional: `DELETE /specialFurnitureRequests/:id`
   Result: cancels the request only if it is `PENDING`.

**Admin Review Flow**

1. `POST /auth/login` as admin
2. `GET /specialFurnitureRequests`
   Optional filters: `status`, `userId`
3. `PATCH /specialFurnitureRequests/:id/review`
   Body: `status`, optional `adminNote`

**Postconditions**

- The request is visible in the user's history.
- Admin review changes the request status from `PENDING`.

**Invalid Sequences**

- Do not submit a special furniture request before login.
- Do not cancel or review a special furniture request after it leaves `PENDING`.
- Do not call `/specialFurnitureRequests/:id/review` as a non-admin user.

## 11. Admin Read Models Across Request Workflows

These admin-only collection endpoints are used after admin login to monitor workflow state before reviewing individual requests:

- `GET /bookingRequests`
- `GET /sellUnitRequests`
- `GET /unitOrderRequests`
- `GET /finishRequests`
- `GET /furnitureBookings`
- `GET /specialFurnitureRequests`

Typical admin sequence:

1. `POST /auth/login` as admin
2. Query the relevant collection with filters such as `status`, `userId`, or target resource ids
3. Open one record with `GET /resource/:id` if needed
4. Complete the decision with `PATCH /resource/:id/review`

The backend blocks normal users from these collection and review endpoints.
