# API Server

> Generated with [Backend Creator (bcm)](https://github.com/Mahmoud-s-Khedr/backgen)

A production-ready Express.js REST API with TypeScript, Prisma ORM (PostgreSQL), and auto-generated Swagger documentation.

## SRS Workflow Status

This backend now exposes workflow-specific endpoints for the SRS-critical flows instead of relying on public generated CRUD for users and request modules.

- Auth: `/api/v1/auth/register`, `/api/v1/auth/verify-otp`, `/api/v1/auth/login`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`
- Profile: `/api/v1/users/me`, `PATCH /api/v1/users/me`, `/api/v1/users/me/change-password`
- Request history: `/api/v1/bookingRequests/me`, `/api/v1/sellUnitRequests/me`, `/api/v1/unitOrderRequests/me`, `/api/v1/finishRequests/me`, `/api/v1/furnitureBookings/me`, `/api/v1/specialFurnitureRequests/me`
- Admin review: `PATCH /api/v1/<request-resource>/:id/review`
- User cancellation: `DELETE /api/v1/<request-resource>/:id` while the request is still `PENDING`

`openapi.json` still needs a full regeneration pass to mirror the new route surface exactly.

## Models

- **User** -- `11` fields, `10` relations
- **OtpToken** -- `6` fields, `0` relations
- **PasswordResetToken** -- `6` fields, `0` relations
- **GalleryItem** -- `11` fields, `3` relations
- **Comment** -- `6` fields, `2` relations
- **Reaction** -- `5` fields, `2` relations
- **Location** -- `7` fields, `1` relations
- **Unit** -- `14` fields, `4` relations
- **BookingRequest** -- `11` fields, `2` relations
- **SellUnitRequest** -- `15` fields, `2` relations
- **UnitOrderRequest** -- `14` fields, `1` relations
- **Finish** -- `11` fields, `2` relations
- **FinishRequest** -- `11` fields, `2` relations
- **FurnitureItem** -- `9` fields, `2` relations
- **FurnitureBooking** -- `11` fields, `2` relations
- **SpecialFurnitureRequest** -- `9` fields, `1` relations
- **Favorite** -- `8` fields, `5` relations
- **WhatsappOpenEvent** -- `6` fields, `1` relations

## Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Run database migrations
pnpm exec prisma migrate dev --name init

# Start development server
pnpm dev
\`\`\`

The server and test runtime auto-load environment variables from `.env` via `dotenv`.
Keep `.env` present (for example, by copying `.env.example`) before running `pnpm dev` or `pnpm test`.

## API Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

## Available Endpoints

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/users\` | List all |
| POST | \`/api/users\` | Create |
| GET | \`/api/users/:id\` | Get by key |
| PUT | \`/api/users/:id\` | Full update |
| PATCH | \`/api/users/:id\` | Partial update |
| DELETE | \`/api/users/:id\` | Delete |

### OtpToken

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/otpTokens\` | List all |
| POST | \`/api/otpTokens\` | Create |
| GET | \`/api/otpTokens/:id\` | Get by key |
| PUT | \`/api/otpTokens/:id\` | Full update |
| PATCH | \`/api/otpTokens/:id\` | Partial update |
| DELETE | \`/api/otpTokens/:id\` | Delete |

### PasswordResetToken

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/passwordResetTokens\` | List all |
| POST | \`/api/passwordResetTokens\` | Create |
| GET | \`/api/passwordResetTokens/:id\` | Get by key |
| PUT | \`/api/passwordResetTokens/:id\` | Full update |
| PATCH | \`/api/passwordResetTokens/:id\` | Partial update |
| DELETE | \`/api/passwordResetTokens/:id\` | Delete |

### GalleryItem

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/galleryItems\` | List all |
| POST | \`/api/galleryItems\` | Create |
| GET | \`/api/galleryItems/:id\` | Get by key |
| PUT | \`/api/galleryItems/:id\` | Full update |
| PATCH | \`/api/galleryItems/:id\` | Partial update |
| DELETE | \`/api/galleryItems/:id\` | Delete |

### Comment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/comments\` | List all |
| POST | \`/api/comments\` | Create |
| GET | \`/api/comments/:id\` | Get by key |
| PUT | \`/api/comments/:id\` | Full update |
| PATCH | \`/api/comments/:id\` | Partial update |
| DELETE | \`/api/comments/:id\` | Delete |

### Reaction

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/reactions\` | List all |
| POST | \`/api/reactions\` | Create |
| GET | \`/api/reactions/:id\` | Get by key |
| PUT | \`/api/reactions/:id\` | Full update |
| PATCH | \`/api/reactions/:id\` | Partial update |
| DELETE | \`/api/reactions/:id\` | Delete |

### Location

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/locations\` | List all |
| POST | \`/api/locations\` | Create |
| GET | \`/api/locations/:id\` | Get by key |
| PUT | \`/api/locations/:id\` | Full update |
| PATCH | \`/api/locations/:id\` | Partial update |
| DELETE | \`/api/locations/:id\` | Delete |

### Unit

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/units\` | List all |
| POST | \`/api/units\` | Create |
| GET | \`/api/units/:id\` | Get by key |
| PUT | \`/api/units/:id\` | Full update |
| PATCH | \`/api/units/:id\` | Partial update |
| DELETE | \`/api/units/:id\` | Delete |

### BookingRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/bookingRequests\` | List all |
| POST | \`/api/bookingRequests\` | Create |
| GET | \`/api/bookingRequests/:id\` | Get by key |
| PUT | \`/api/bookingRequests/:id\` | Full update |
| PATCH | \`/api/bookingRequests/:id\` | Partial update |
| DELETE | \`/api/bookingRequests/:id\` | Delete |

### SellUnitRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/sellUnitRequests\` | List all |
| POST | \`/api/sellUnitRequests\` | Create |
| GET | \`/api/sellUnitRequests/:id\` | Get by key |
| PUT | \`/api/sellUnitRequests/:id\` | Full update |
| PATCH | \`/api/sellUnitRequests/:id\` | Partial update |
| DELETE | \`/api/sellUnitRequests/:id\` | Delete |

### UnitOrderRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/unitOrderRequests\` | List all |
| POST | \`/api/unitOrderRequests\` | Create |
| GET | \`/api/unitOrderRequests/:id\` | Get by key |
| PUT | \`/api/unitOrderRequests/:id\` | Full update |
| PATCH | \`/api/unitOrderRequests/:id\` | Partial update |
| DELETE | \`/api/unitOrderRequests/:id\` | Delete |

### Finish

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/finishes\` | List all |
| POST | \`/api/finishes\` | Create |
| GET | \`/api/finishes/:id\` | Get by key |
| PUT | \`/api/finishes/:id\` | Full update |
| PATCH | \`/api/finishes/:id\` | Partial update |
| DELETE | \`/api/finishes/:id\` | Delete |

### FinishRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/finishRequests\` | List all |
| POST | \`/api/finishRequests\` | Create |
| GET | \`/api/finishRequests/:id\` | Get by key |
| PUT | \`/api/finishRequests/:id\` | Full update |
| PATCH | \`/api/finishRequests/:id\` | Partial update |
| DELETE | \`/api/finishRequests/:id\` | Delete |

### FurnitureItem

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/furnitureItems\` | List all |
| POST | \`/api/furnitureItems\` | Create |
| GET | \`/api/furnitureItems/:id\` | Get by key |
| PUT | \`/api/furnitureItems/:id\` | Full update |
| PATCH | \`/api/furnitureItems/:id\` | Partial update |
| DELETE | \`/api/furnitureItems/:id\` | Delete |

### FurnitureBooking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/furnitureBookings\` | List all |
| POST | \`/api/furnitureBookings\` | Create |
| GET | \`/api/furnitureBookings/:id\` | Get by key |
| PUT | \`/api/furnitureBookings/:id\` | Full update |
| PATCH | \`/api/furnitureBookings/:id\` | Partial update |
| DELETE | \`/api/furnitureBookings/:id\` | Delete |

### SpecialFurnitureRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/specialFurnitureRequests\` | List all |
| POST | \`/api/specialFurnitureRequests\` | Create |
| GET | \`/api/specialFurnitureRequests/:id\` | Get by key |
| PUT | \`/api/specialFurnitureRequests/:id\` | Full update |
| PATCH | \`/api/specialFurnitureRequests/:id\` | Partial update |
| DELETE | \`/api/specialFurnitureRequests/:id\` | Delete |

### Favorite

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/favorites\` | List all |
| POST | \`/api/favorites\` | Create |
| GET | \`/api/favorites/:id\` | Get by key |
| PUT | \`/api/favorites/:id\` | Full update |
| PATCH | \`/api/favorites/:id\` | Partial update |
| DELETE | \`/api/favorites/:id\` | Delete |

### WhatsappOpenEvent

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/whatsappOpenEvents\` | List all |
| POST | \`/api/whatsappOpenEvents\` | Create |
| GET | \`/api/whatsappOpenEvents/:id\` | Get by key |
| PUT | \`/api/whatsappOpenEvents/:id\` | Full update |
| PATCH | \`/api/whatsappOpenEvents/:id\` | Partial update |
| DELETE | \`/api/whatsappOpenEvents/:id\` | Delete |

## Query Parameters

\`\`\`
GET /api/resource?page=1&limit=20&sort=createdAt&order=desc&filter[field]=value&include=relation
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`pnpm dev\` | Start development server with hot reload |
| \`pnpm build\` | Compile TypeScript |
| \`pnpm start\` | Start production server |
| \`pnpm test\` | Run tests |
| \`pnpm migrate\` | Run Prisma migrations |
| \`pnpm seed\` | Seed the database |
| \`pnpm studio\` | Open Prisma Studio |

The seed script respects model dependencies, handles custom/composite FK mappings,
and prints one sample auth login per auth model. Seeded auth passwords default to
\`SeedPassword123!\`. Optional cyclic/self relations are left unset; required
cyclic/self relations fail fast before cleanup.

## Docker

\`\`\`bash
# 1) Create an env file (required for JWT_SECRET and optional DB credentials/ports)
cp .env.example .env

# 2) Set a strong JWT secret (32+ chars)
# Example:
openssl rand -base64 32
# Then paste it into JWT_SECRET in .env

# 3) Build and start API + Postgres + Redis
docker compose up --build -d

# 4) Follow logs (optional)
docker compose logs -f app

# 5) Stop everything
docker compose down

# 6) Stop + remove DB volume too (optional, deletes local DB data)
docker compose down -v
\`\`\`

Docker startup bootstraps the schema automatically before the server starts.
If Prisma migration directories already exist, the container runs \`prisma migrate deploy\`.
If no real migration directories exist yet, it falls back to \`prisma db push\`
so fresh generated projects can still boot in Docker.
Keep Docker BuildKit enabled so the generated Dockerfile can reuse pnpm and
node-gyp caches during image builds.

After startup:

- API: [http://localhost:3000](http://localhost:3000)
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Project Structure

\`\`\`
src/
  config/         Configuration (database, cors, logger, env)
  middlewares/     Express middlewares (auth, error, rate-limit)
  modules/        Feature modules (controller, service, routes, dto)
  utils/          Utilities (query builder, response helpers)
  app.ts          Express app setup
  server.ts       Server entry point
prisma/
  schema.prisma   Database schema
  seed.ts         Database seeding
Dockerfile
docker-compose.yml
openapi.json      OpenAPI 3.0 specification
\`\`\`

---

*Bootstrapped with [Backend Creator (bcm)](https://github.com/Mahmoud-s-Khedr/backgen)*
