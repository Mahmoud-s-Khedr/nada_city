# Mobile & Frontend API Integration Guide

This guide is the integration source of truth for web/mobile clients.

- Base URL prefix: `/api/v1`
- Primary source order used: mounted routes (`src/app.ts`) -> route validation schemas/DTOs -> runtime response helpers/middleware -> generated OpenAPI (`nada-city-api.json`)
- Important: some OpenAPI responses are generic; clients should follow **runtime response envelopes** described below.

## 1) Response Contract (Runtime)

### Success responses

- `200 OK`
```json
{
  "data": {},
  "meta": {}
}
```
`meta` is optional (used mostly on paginated/list endpoints).

- `201 Created`
```json
{
  "data": {}
}
```

- `204 No Content`
- Empty response body.

### Error responses (Problem Details)

- Typical structure:
```json
{
  "type": "validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Request validation failed.",
  "instance": "/api/v1/..."
}
```

- Validation errors may also include:
```json
{
  "errors": [
    { "path": "field", "message": "...", "code": "..." }
  ]
}
```

- Common error statuses across APIs: `400, 401, 403, 404, 409, 422, 500, 503`.

## 2) Integration Conventions

### Authentication

- Bearer auth format:
```http
Authorization: Bearer <accessToken>
```
- Access/refresh lifecycle:
1. `POST /api/v1/auth/login` -> returns `accessToken`, `refreshToken`
2. Use access token on protected routes
3. On token expiry, call `POST /api/v1/auth/refresh` with `refreshToken`
4. End session with `POST /api/v1/auth/logout` with `refreshToken`

### Authorization and ownership

- `Public`: no token required.
- `Bearer user/admin`: any authenticated user.
- `Admin only`: authenticated user with `ADMIN` role.
- Ownership-scoped resources enforce owner-or-admin access for view/cancel/update in request workflows.

### Query serialization

- Pagination: `?page=1&limit=20`
- Sort: `?sort=createdAt&order=desc`
- Search: `?search=keyword`
- Includes: `?include=relationA,relationB`
- Filters (generic lists): `?filter[field]=value`
- Cursor endpoints: `?cursor=<id>&pageSize=20&direction=forward`

### Workflow state constraints

- Cancel/review endpoints for request workflows are typically valid only while status is `PENDING`.

## 3) Endpoint Catalog (Mounted in `src/app.ts`)

Legend:
- `Client`: directly consumed by app clients.
- `Admin`: operational/admin UI use.

---

## Auth (`/api/v1/auth`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `POST /register` | Public | `name*`, `email*`, `password*`, `phone?`, `address?` | - | `200 {data:{userId,email,verificationRequired}}` | `409` existing verified user, `422` validation | Register unverified account and send OTP. |
| `POST /verify-otp` | Public | `email*`, `code*` | - | `200 {data:{verified:true}}` | `401` invalid/expired OTP, `404` user missing | Verify account after registration. |
| `POST /login` | Public | `email*`, `password*` | - | `200 {data:{accessToken,refreshToken}}` | `401` invalid creds, `403` unverified account | Start authenticated session. |
| `POST /refresh` | Public | `refreshToken*` | - | `200 {data:{accessToken,refreshToken}}` | `401` invalid/expired refresh token | Rotate tokens when access token expires. |
| `POST /logout` | Public | `refreshToken*` | - | `200 {data:{loggedOut:true}}` | `401` invalid refresh token | Invalidate refresh token / sign out. |
| `POST /forgot-password` | Public | `email*` | - | `200 {data:{sent:true}}` | `404/403` account state issues | Send reset token to user email. |
| `POST /reset-password` | Public | `token*`, `password*`, `confirmPassword*` | - | `200 {data:{changed:true}}` | `401` invalid/expired token, `422` mismatch/weak password | Reset password with issued token. |

---

## Storage (`/api/v1/storage`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `POST /presigned-url` | Bearer user/admin | `filename*`, `contentType?`, `operation?` (`put`/`get`) | - | `200 {data:{url,key,method,...}}` | `401`, `422`, `500` | Request signed upload/download URL before direct object storage access. |

---

## Users (`/api/v1/users`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /me` | Bearer user/admin | - | - | `200 {data:{id,name,email,phone,address,rate,role,isVerified,createdAt,updatedAt}}` | `401`, `404` | Fetch current user profile for app session. |
| `PATCH /me` | Bearer user/admin | `name?`, `phone?`, `address?` | - | `200 {data:{...user}}` | `401`, `422` | Update profile fields. |
| `POST /me/change-password` | Bearer user/admin | `oldPassword*`, `newPassword*`, `confirmPassword*` | - | `200 {data:{changed:true}}` | `401` wrong old password, `422` validation | Change password from authenticated session. |

---

## Gallery Items (`/api/v1/galleryItems`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Public | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200 {data:[...],meta?}` | `400`, `422` | Public gallery listing/search. |
| `GET /cursor` | Public | - | Query: `cursor,pageSize,direction` | `200 {data:[...],meta:{hasMore,nextCursor,pageSize}}` | `400`, `422` | Cursor pagination variant. |
| `GET /:id` | Public | - | Path: `id`, Query: `include` | `200 {data:{...}}` | `404` | Read single gallery item. |
| `POST /` | Admin only | `title*`,`description*`,`type*`,`details?`,`keywords?`,`imageUrls?`,`videoUrls?` | - | `201 {data:{...}}` | `401`,`403`,`422` | Create gallery item. |
| `PUT /:id` | Admin only | same required shape as create | Path: `id` | `200 {data:{...}}` | `401`,`403`,`404`,`422` | Full update of gallery item. |
| `PATCH /:id` | Admin only | partial gallery fields | Path: `id` | `200 {data:{...}}` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Admin only | - | Path: `id` | `204` | `401`,`403`,`404` | Soft-delete/remove item. |

---

## Comments (`/api/v1/comments`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Bearer user/admin | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200 {data:[...],meta?}` | `401`,`422` | List comments for authenticated experiences. |
| `GET /cursor` | Bearer user/admin | - | Query: `cursor,pageSize,direction` | `200 {data:[...],meta?...}` | `401`,`422` | Cursor-based comment list. |
| `GET /:id` | Bearer user/admin | - | Path: `id`, Query:`include` | `200 {data:{...}}` | `401`,`404` | Fetch one comment. |
| `POST /` | Bearer user/admin | `body*`,`galleryItemId*` | - | `201 {data:{...}}` | `401`,`422` | Create comment on gallery item. |
| `PUT /:id` | Bearer user/admin | `body*` | Path: `id` | `200 {data:{...}}` | `401`,`403`,`404`,`422` | Full update (owner/admin). |
| `PATCH /:id` | Bearer user/admin | `body?` | Path: `id` | `200 {data:{...}}` | `401`,`403`,`404`,`422` | Partial update (owner/admin). |
| `DELETE /:id` | Bearer user/admin | - | Path: `id` | `204` | `401`,`403`,`404` | Delete (owner/admin). |

---

## Reactions (`/api/v1/reactions`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Bearer user/admin | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` | `401`,`422` | List reactions. |
| `GET /:id` | Bearer user/admin | - | Path:`id`, Query:`include` | `200` | `401`,`404` | Fetch one reaction. |
| `POST /` | Bearer user/admin | `galleryItemId*`,`type?` (`LIKE`,`LOVE`,`WOW`) | - | `201` | `401`,`422` | Create reaction. |
| `PUT /:id` | Bearer user/admin | `type?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Replace reaction type. |
| `PATCH /:id` | Bearer user/admin | `type?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404` | Delete reaction. |

---

## Locations (`/api/v1/locations`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Public | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` | `422` | Public location listing. |
| `GET /:id` | Public | - | Path:`id`, Query:`include` | `200` | `404` | Read location details. |
| `POST /` | Admin only | `address*`,`latitude?`,`longitude?` | - | `201` | `401`,`403`,`422` | Create location. |
| `PUT /:id` | Admin only | `address*`,`latitude?`,`longitude?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Full update. |
| `PATCH /:id` | Admin only | partial location fields | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Admin only | - | Path:`id` | `204` | `401`,`403`,`404` | Delete location. |

---

## Units (`/api/v1/units`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Public | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` (public listing defaults to available units) | `422` | Unit catalog browse/search for clients. |
| `GET /cursor` | Public | - | Query: `cursor,pageSize,direction` | `200` | `422` | Cursor pagination. |
| `GET /:id` | Public | - | Path:`id`, Query:`include` | `200` | `404` | Get one unit. |
| `POST /` | Admin only | `title*`,`description*`,`price*`,`type*`,`keywords?`,`availability?`,`imageUrls?`,`videoUrls?`,`location*` | - | `201` | `401`,`403`,`422` | Create unit. |
| `PUT /:id` | Admin only | same as create | Path:`id` | `200` | `401`,`403`,`404`,`422` | Full update. |
| `PATCH /:id` | Admin only | partial unit fields | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Admin only | - | Path:`id` | `204` | `401`,`403`,`404` | Delete unit. |

---

## Booking Requests (`/api/v1/bookingRequests`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query: `status?`,`userId?`,`unitId?` | `200` | `401`,`403` | Admin queue listing. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User's own booking history. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one request. |
| `POST /` | Bearer user/admin | `unitId*`,`name?`,`phone?`,`address?`,`details?` | - | `201` | `401`,`422` | Create booking request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel only while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Admin accept/reject review. |

---

## Sell Unit Requests (`/api/v1/sellUnitRequests`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query: `status?`,`userId?` | `200` | `401`,`403` | Admin review queue. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User sell requests. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one. |
| `POST /` | Bearer user/admin | `title*`,`description*`,`price*`,`type*`,`address*`,`locationId?`,`details?`,`imageUrls?`,`videoUrls?` | - | `201` | `401`,`422` | Submit sell-unit request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?`, optional editable unit fields (`title`,`description`,`price`,`type`,`address`,`locationId`,`details`,`imageUrls`,`videoUrls`) | Path:`id` | `200` | `401`,`403`,`404`,`422` | Review request; `ACCEPTED` flow creates a unit. |

---

## Unit Order Requests (`/api/v1/unitOrderRequests`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query:`status?`,`userId?` | `200` | `401`,`403` | Admin order queue. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User order requests. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one. |
| `POST /` | Bearer user/admin | `title?`,`description?`,`minPrice?`,`maxPrice?`,`type?`,`address?`,`location?`,`details?` | - | `201` | `401`,`422` | Submit custom desired-unit request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Admin review decision. |

---

## Finishes (`/api/v1/finishes`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Public | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` | `422` | Public finishes catalog listing. |
| `GET /cursor` | Public | - | Query:`cursor,pageSize,direction` | `200` | `422` | Cursor listing. |
| `GET /:id` | Public | - | Path:`id`, Query:`include` | `200` | `404` | Read finish details. |
| `POST /` | Admin only | `title*`,`description*`,`price*`,`type*`,`subType*`,`imageUrls?`,`videoUrls?` | - | `201` | `401`,`403`,`422` | Create finish. |
| `PUT /:id` | Admin only | same required fields as create | Path:`id` | `200` | `401`,`403`,`404`,`422` | Full update. |
| `PATCH /:id` | Admin only | partial finish fields | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Admin only | - | Path:`id` | `204` | `401`,`403`,`404` | Delete finish. |

---

## Finish Requests (`/api/v1/finishRequests`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query:`status?`,`userId?`,`finishId?` | `200` | `401`,`403` | Admin queue. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User finish requests. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one. |
| `POST /` | Bearer user/admin | `address*`,`requestedAt*`,`finishTypes*`,`finishId?`,`details?` | - | `201` | `401`,`422` | Submit finish service request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Admin review decision. |

---

## Furniture Items (`/api/v1/furnitureItems`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Public | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` | `422` | Browse furniture catalog. |
| `GET /cursor` | Public | - | Query:`cursor,pageSize,direction` | `200` | `422` | Cursor listing. |
| `GET /:id` | Public | - | Path:`id`, Query:`include` | `200` | `404` | Read one furniture item. |
| `POST /` | Admin only | `title*`,`description*`,`price*`,`imageUrls?`,`videoUrls?` | - | `201` | `401`,`403`,`422` | Create item. |
| `PUT /:id` | Admin only | same required fields as create | Path:`id` | `200` | `401`,`403`,`404`,`422` | Full update. |
| `PATCH /:id` | Admin only | partial furniture fields | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Admin only | - | Path:`id` | `204` | `401`,`403`,`404` | Delete item. |

---

## Furniture Bookings (`/api/v1/furnitureBookings`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query:`status?`,`userId?`,`furnitureItemId?` | `200` | `401`,`403` | Admin booking queue. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User booking history. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one booking. |
| `POST /` | Bearer user/admin | `furnitureItemId*`,`name*`,`phone*`,`address*`,`details?` | - | `201` | `401`,`422` | Submit furniture booking request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Admin review decision. |

---

## Special Furniture Requests (`/api/v1/specialFurnitureRequests`) [Client + Admin]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Admin only | - | Query:`status?`,`userId?` | `200` | `401`,`403` | Admin special request queue. |
| `GET /me` | Bearer user/admin | - | - | `200` | `401` | User special request history. |
| `GET /:id` | Bearer user/admin | - | Path:`id` | `200` | `401`,`403`,`404` | Owner/admin read one request. |
| `POST /` | Bearer user/admin | `name*`,`phone*`,`details*` | - | `201` | `401`,`422` | Submit custom furniture request. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404`,`422` | Cancel while `PENDING`. |
| `PATCH /:id/review` | Admin only | `status*`,`adminNote?` | Path:`id` | `200` | `401`,`403`,`404`,`422` | Admin review decision. |

---

## Favorites (`/api/v1/favorites`) [Client]

| Endpoint | Auth | Request Body | Path/Query | Success | Common Errors | Usage |
|---|---|---|---|---|---|---|
| `GET /` | Bearer user/admin | - | Query: `page,limit,sort,order,search,include,filter[...]` | `200` | `401`,`422` | List favorites for authenticated user context. |
| `GET /:id` | Bearer user/admin | - | Path:`id`, Query:`include` | `200` | `401`,`404` | Get one favorite. |
| `POST /` | Bearer user/admin | `type*` + one target id (`galleryItemId`/`unitId`/`finishId`/`furnitureItemId`) | - | `201` | `401`,`422` | Create favorite link. |
| `PUT /:id` | Bearer user/admin | `type*` + optional target ids | Path:`id` | `200` | `401`,`403`,`404`,`422` | Full update. |
| `PATCH /:id` | Bearer user/admin | partial favorite fields | Path:`id` | `200` | `401`,`403`,`404`,`422` | Partial update. |
| `DELETE /:id` | Bearer user/admin | - | Path:`id` | `204` | `401`,`403`,`404` | Delete favorite. |

## 4) Internal Routes Present in Code but Not Mounted

The following route modules exist but are **not mounted in `src/app.ts`**; clients should treat them as internal/non-public unless explicitly mounted later.

### OTP Token (`src/modules/otpToken/otpToken.routes.ts`) [Internal]

- `GET /` (list)
- `GET /:id`
- `POST /` body: `email*`, `code*`, `expiresAt*`, `consumed?`
- `PUT /:id` same as create
- `PATCH /:id` partial fields
- `DELETE /:id`

### Password Reset Token (`src/modules/passwordResetToken/passwordResetToken.routes.ts`) [Internal]

- `GET /` (list)
- `GET /:id`
- `POST /` body: `email*`, `token*`, `expiresAt*`, `consumed?`
- `PUT /:id` same as create
- `PATCH /:id` partial fields
- `DELETE /:id`

## 5) Quick Client Playbooks

### Authentication lifecycle
1. Register -> verify OTP -> login.
2. Attach `Authorization` header for protected APIs.
3. On `401` due to token expiry, call `/auth/refresh`, retry original request once.
4. On logout, clear both tokens locally.

### Request-workflow lifecycle (booking/sell/order/finish/furniture/special)
1. Create request as authenticated user.
2. Read own list via `/me` endpoint.
3. Cancel only while `PENDING`.
4. Admin reviews via `PATCH /:id/review`.

### Media upload lifecycle
1. Call `POST /storage/presigned-url` with `filename` and operation.
2. Upload/download directly to storage provider using returned URL/method.
3. Persist resulting media URL/key in catalog/request APIs as needed.
