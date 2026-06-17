# Production Deployment Guide

This deployment keeps these services on the host machine:

- `nginx` as the public reverse proxy and TLS terminator
- `PostgreSQL`
- `MinIO`

Docker Compose runs:

- `app` replicas
- `redis`
- an internal `nginx` reverse proxy that fronts the scaled `app` containers
- a one-off `migrate` job

## 1. Host prerequisites

- Docker Engine with Compose plugin
- Host `nginx`
- Host `PostgreSQL` reachable from Docker containers
- Host `MinIO` reachable from Docker containers
- Open ports for public `nginx`, MinIO, and PostgreSQL as required by your server policy

On Linux, this setup uses `host.docker.internal` mapped through Docker's `host-gateway`.

## 2. Production environment file

Create `.env.production` from [.env.production.example](/home/mk/Projects/freelance/mohand/nada_city/.env.production.example).

Important values:

- `DATABASE_URL` must point to host PostgreSQL, for example `host.docker.internal:5432`
- `REDIS_URL` is injected by Compose and should stay on the internal Docker network
- `S3_ENDPOINT` must point to host MinIO, for example `http://host.docker.internal:9000`
- `S3_PUBLIC_BASE_URL` must be the client-facing MinIO or CDN URL
- `JWT_SECRET` must be a strong random secret
- `RESEND_API_KEY` and `FROM_EMAIL` are required in production

## 3. Host MinIO bucket bootstrap

Create the uploads bucket on the host MinIO server before starting the stack.

Example:

```bash
mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
mc mb local/nada-city-uploads --ignore-existing
```

If your client uploads depend on public object URLs, also configure the bucket policy and public endpoint to match `S3_PUBLIC_BASE_URL`.

## 4. Host Nginx public proxy

Add a host `nginx` site that proxies to the Compose `nginx` listener on loopback.

Example:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:8080;
    }
}
```

If you terminate TLS on the host, keep the upstream target on `127.0.0.1:${COMPOSE_NGINX_PORT}`.

## 5. Start the stack

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --scale app=2
```

What happens:

- `redis` starts and becomes healthy
- `migrate` runs `prisma migrate deploy` once
- `app` replicas start after migration succeeds
- Compose `nginx` listens on `127.0.0.1:${COMPOSE_NGINX_PORT}`
- host `nginx` forwards public traffic into Compose

## 6. Runtime behavior

- `GET /live` is the liveness endpoint for container healthchecks
- `GET /ready` checks `PostgreSQL` and `Redis`
- `GET /health` remains a compatibility alias for readiness
- `restart: unless-stopped` restarts containers when the main process exits
- Docker healthchecks expose unhealthy state without using dependency readiness as a restart trigger

## 7. Validation commands

Render the Compose config:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml config
```

Check the app through the public chain:

```bash
curl -f http://127.0.0.1:8080/live
curl -f http://127.0.0.1:8080/ready
```

Inspect services:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app nginx migrate redis
```

## 8. Scaling and rollout

Default replica count is `2`.

Scale the backend:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --scale app=2
```

For a new release:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build --scale app=2
```

## 9. Rollback

Rollback is image-based:

1. Rebuild or retag the previous application image.
2. Run `docker compose ... up -d --scale app=2` with that image.
3. If the release included schema changes, only roll back to an application version compatible with the current migrated schema.
