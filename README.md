# API Server

> Generated with [Backend Creator (bcm)](https://github.com/Mahmoud-s-Khedr/backgen)

A production-ready Express.js REST API with TypeScript, Prisma ORM (PostgreSQL), and auto-generated Swagger documentation.

## SRS Workflow Status

This backend now exposes workflow-specific endpoints for the SRS-critical flows instead of relying on public generated CRUD for users and request modules.

- Auth: `/api/v1/auth/register`, `/api/v1/auth/verify-otp`, `/api/v1/auth/login`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`
- Profile: `/api/v1/users/me`, `PATCH /api/v1/users/me`, `/api/v1/users/me/change-password`
- Account deletion: `DELETE /api/v1/me/account` (requires in-app `DELETE` confirmation; clears account data and session tokens)
- Request history: `/api/v1/bookingRequests/me`, `/api/v1/sellUnitRequests/me`, `/api/v1/unitOrderRequests/me`, `/api/v1/finishRequests/me`, `/api/v1/furnitureBookings/me`, `/api/v1/specialFurnitureRequests/me`
- Admin review: `PATCH /api/v1/<request-resource>/:id/review`
- User cancellation: `DELETE /api/v1/<request-resource>/:id` while the request is still `PENDING`

`openapi.json` still needs a full regeneration pass to mirror the new route surface exactly.

## Models

- **User** -- `11` fields, `9` relations
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

## Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Preflight database auth/connectivity
pnpm check:db

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
- **Liveness Check**: [http://localhost:3000/live](http://localhost:3000/live)
- **Readiness Check**: [http://localhost:3000/ready](http://localhost:3000/ready)

## Production Deployment

Production deployment artifacts live here:

- Compose stack: [docker-compose.prod.yml](/home/mk/Projects/freelance/mohand/nada_city/docker-compose.prod.yml)
- Production env template: [.env.production.example](/home/mk/Projects/freelance/mohand/nada_city/.env.production.example)
- Deployment runbook: [docs/production-deployment.md](/home/mk/Projects/freelance/mohand/nada_city/docs/production-deployment.md)

## Available Endpoints

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/users\` | List all |
| POST | \`/api/v1/users\` | Create |
| GET | \`/api/v1/users/:id\` | Get by key |
| PUT | \`/api/v1/users/:id\` | Full update |
| PATCH | \`/api/v1/users/:id\` | Partial update |
| DELETE | \`/api/v1/users/:id\` | Delete |

### OtpToken

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/otpTokens\` | List all |
| POST | \`/api/v1/otpTokens\` | Create |
| GET | \`/api/v1/otpTokens/:id\` | Get by key |
| PUT | \`/api/v1/otpTokens/:id\` | Full update |
| PATCH | \`/api/v1/otpTokens/:id\` | Partial update |
| DELETE | \`/api/v1/otpTokens/:id\` | Delete |

### PasswordResetToken

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/passwordResetTokens\` | List all |
| POST | \`/api/v1/passwordResetTokens\` | Create |
| GET | \`/api/v1/passwordResetTokens/:id\` | Get by key |
| PUT | \`/api/v1/passwordResetTokens/:id\` | Full update |
| PATCH | \`/api/v1/passwordResetTokens/:id\` | Partial update |
| DELETE | \`/api/v1/passwordResetTokens/:id\` | Delete |

### GalleryItem

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/galleryItems\` | List all |
| POST | \`/api/v1/galleryItems\` | Create |
| GET | \`/api/v1/galleryItems/:id\` | Get by key |
| PUT | \`/api/v1/galleryItems/:id\` | Full update |
| PATCH | \`/api/v1/galleryItems/:id\` | Partial update |
| DELETE | \`/api/v1/galleryItems/:id\` | Delete |

### Comment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/comments\` | List all |
| POST | \`/api/v1/comments\` | Create |
| GET | \`/api/v1/comments/:id\` | Get by key |
| PUT | \`/api/v1/comments/:id\` | Full update |
| PATCH | \`/api/v1/comments/:id\` | Partial update |
| DELETE | \`/api/v1/comments/:id\` | Delete |

### Reaction

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/reactions\` | List all |
| POST | \`/api/v1/reactions\` | Create |
| GET | \`/api/v1/reactions/:id\` | Get by key |
| PUT | \`/api/v1/reactions/:id\` | Full update |
| PATCH | \`/api/v1/reactions/:id\` | Partial update |
| DELETE | \`/api/v1/reactions/:id\` | Delete |

### Location

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/locations\` | List all |
| POST | \`/api/v1/locations\` | Create |
| GET | \`/api/v1/locations/:id\` | Get by key |
| PUT | \`/api/v1/locations/:id\` | Full update |
| PATCH | \`/api/v1/locations/:id\` | Partial update |
| DELETE | \`/api/v1/locations/:id\` | Delete |

### Unit

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/units\` | List all |
| POST | \`/api/v1/units\` | Create |
| GET | \`/api/v1/units/:id\` | Get by key |
| PUT | \`/api/v1/units/:id\` | Full update |
| PATCH | \`/api/v1/units/:id\` | Partial update |
| DELETE | \`/api/v1/units/:id\` | Delete |

### BookingRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/bookingRequests\` | List all |
| POST | \`/api/v1/bookingRequests\` | Create |
| GET | \`/api/v1/bookingRequests/:id\` | Get by key |
| PUT | \`/api/v1/bookingRequests/:id\` | Full update |
| PATCH | \`/api/v1/bookingRequests/:id\` | Partial update |
| DELETE | \`/api/v1/bookingRequests/:id\` | Delete |

### SellUnitRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/sellUnitRequests\` | List all |
| POST | \`/api/v1/sellUnitRequests\` | Create |
| GET | \`/api/v1/sellUnitRequests/:id\` | Get by key |
| PUT | \`/api/v1/sellUnitRequests/:id\` | Full update |
| PATCH | \`/api/v1/sellUnitRequests/:id\` | Partial update |
| DELETE | \`/api/v1/sellUnitRequests/:id\` | Delete |

### UnitOrderRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/unitOrderRequests\` | List all |
| POST | \`/api/v1/unitOrderRequests\` | Create |
| GET | \`/api/v1/unitOrderRequests/:id\` | Get by key |
| PUT | \`/api/v1/unitOrderRequests/:id\` | Full update |
| PATCH | \`/api/v1/unitOrderRequests/:id\` | Partial update |
| DELETE | \`/api/v1/unitOrderRequests/:id\` | Delete |

### Finish

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/finishes\` | List all |
| POST | \`/api/v1/finishes\` | Create |
| GET | \`/api/v1/finishes/:id\` | Get by key |
| PUT | \`/api/v1/finishes/:id\` | Full update |
| PATCH | \`/api/v1/finishes/:id\` | Partial update |
| DELETE | \`/api/v1/finishes/:id\` | Delete |

### FinishRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/finishRequests\` | List all |
| POST | \`/api/v1/finishRequests\` | Create |
| GET | \`/api/v1/finishRequests/:id\` | Get by key |
| PUT | \`/api/v1/finishRequests/:id\` | Full update |
| PATCH | \`/api/v1/finishRequests/:id\` | Partial update |
| DELETE | \`/api/v1/finishRequests/:id\` | Delete |

### FurnitureItem

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/furnitureItems\` | List all |
| POST | \`/api/v1/furnitureItems\` | Create |
| GET | \`/api/v1/furnitureItems/:id\` | Get by key |
| PUT | \`/api/v1/furnitureItems/:id\` | Full update |
| PATCH | \`/api/v1/furnitureItems/:id\` | Partial update |
| DELETE | \`/api/v1/furnitureItems/:id\` | Delete |

### FurnitureBooking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/furnitureBookings\` | List all |
| POST | \`/api/v1/furnitureBookings\` | Create |
| GET | \`/api/v1/furnitureBookings/:id\` | Get by key |
| PUT | \`/api/v1/furnitureBookings/:id\` | Full update |
| PATCH | \`/api/v1/furnitureBookings/:id\` | Partial update |
| DELETE | \`/api/v1/furnitureBookings/:id\` | Delete |

### SpecialFurnitureRequest

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/specialFurnitureRequests\` | List all |
| POST | \`/api/v1/specialFurnitureRequests\` | Create |
| GET | \`/api/v1/specialFurnitureRequests/:id\` | Get by key |
| PUT | \`/api/v1/specialFurnitureRequests/:id\` | Full update |
| PATCH | \`/api/v1/specialFurnitureRequests/:id\` | Partial update |
| DELETE | \`/api/v1/specialFurnitureRequests/:id\` | Delete |

### Favorite

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/favorites\` | List all |
| POST | \`/api/v1/favorites\` | Create |
| GET | \`/api/v1/favorites/:id\` | Get by key |
| PUT | \`/api/v1/favorites/:id\` | Full update |
| PATCH | \`/api/v1/favorites/:id\` | Partial update |
| DELETE | \`/api/v1/favorites/:id\` | Delete |

## Query Parameters

\`\`\`
GET /api/v1/resource?page=1&limit=20&sort=createdAt&order=desc&filter[field]=value&include=relation
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| \`pnpm dev\` | Start development server with hot reload |
| \`pnpm build\` | Compile TypeScript |
| \`pnpm start\` | Start production server |
| \`pnpm test\` | Run tests |
| \`pnpm check:db\` | Validate DB env consistency and verify auth/connectivity |
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

Important: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`,
and `POSTGRES_PORT` must stay aligned with `DATABASE_URL` when provided. The stack
supports local, Docker-network, or remote endpoints; it is not limited to localhost.

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

## Database Drift Runbook

1. Validate env consistency and DB auth:
   \`\`\`bash
   pnpm check:db
   \`\`\`
2. If Docker is used, confirm effective env values:
   \`\`\`bash
   docker compose config | rg "POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB|DATABASE_URL"
   \`\`\`
3. If credentials were changed after Postgres volume initialization, pick one recovery path:
   - Development reset (destructive):
     \`\`\`bash
     docker compose down -v
     docker compose up --build -d
     \`\`\`
   - Non-destructive password sync inside DB:
     \`\`\`bash
     docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"
     \`\`\`
4. Re-run schema bootstrap and verify:
   \`\`\`bash
   docker compose logs app --tail 200
   curl -s http://localhost:3000/health
   \`\`\`

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
