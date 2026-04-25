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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables:\n${JSON.stringify(fieldErrors, null, 2)}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
