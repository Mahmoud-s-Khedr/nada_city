import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment variable validation.
 * Validates all required environment variables at startup.
 * Throws if validation fails.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  POSTGRES_USER: z.string().min(1).optional(),
  POSTGRES_PASSWORD: z.string().min(1).optional(),
  POSTGRES_DB: z.string().min(1).optional(),
  POSTGRES_HOST: z.string().min(1).optional(),
  POSTGRES_PORT: z.coerce.number().int().positive().optional(),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  EXPOSE_TEST_TOKENS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // S3-compatible storage (R2 in production, MinIO in dev)
  S3_ENDPOINT: z.string().url().default('http://localhost:9000'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().default('minioadmin'),
  S3_SECRET_ACCESS_KEY: z.string().default('minioadmin'),
  S3_BUCKET: z.string().default('nada-city-uploads'),
  S3_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  // Resend email (production only)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@nada.city'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables:\n${JSON.stringify(fieldErrors, null, 2)}`);
}

const data = parsed.data;
const databaseUrl = new URL(data.DATABASE_URL);
const dbUsername = decodeURIComponent(databaseUrl.username);
const dbPassword = decodeURIComponent(databaseUrl.password);
const dbName = databaseUrl.pathname.replace(/^\//, '');
const dbHost = databaseUrl.hostname;
const dbPort = databaseUrl.port ? Number(databaseUrl.port) : 5432;

if (data.POSTGRES_USER && data.POSTGRES_USER !== dbUsername) {
  throw new Error(
    `Invalid environment variables:\nPOSTGRES_USER does not match DATABASE_URL username (${data.POSTGRES_USER} !== ${dbUsername}).`
  );
}

if (data.POSTGRES_PASSWORD && data.POSTGRES_PASSWORD !== dbPassword) {
  throw new Error(
    'Invalid environment variables:\nPOSTGRES_PASSWORD does not match DATABASE_URL password.'
  );
}

if (data.POSTGRES_DB && data.POSTGRES_DB !== dbName) {
  throw new Error(
    `Invalid environment variables:\nPOSTGRES_DB does not match DATABASE_URL database (${data.POSTGRES_DB} !== ${dbName}).`
  );
}

if (data.POSTGRES_HOST && data.POSTGRES_HOST !== dbHost) {
  throw new Error(
    `Invalid environment variables:\nPOSTGRES_HOST does not match DATABASE_URL host (${data.POSTGRES_HOST} !== ${dbHost}).`
  );
}

if (data.POSTGRES_PORT && data.POSTGRES_PORT !== dbPort) {
  throw new Error(
    `Invalid environment variables:\nPOSTGRES_PORT does not match DATABASE_URL port (${data.POSTGRES_PORT} !== ${dbPort}).`
  );
}

export const env = data;
export type Env = z.infer<typeof envSchema>;
