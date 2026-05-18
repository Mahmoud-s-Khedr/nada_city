import type { CorsOptions } from 'cors';

function parseCorsOrigin(raw: string | undefined): {
  mode: 'wildcard' | 'single' | 'multi' | 'disabled';
  origin: CorsOptions['origin'];
  credentials: boolean;
  allowedCount: number;
} {
  if (!raw || raw.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      return {
        mode: 'disabled',
        origin: false,
        credentials: false,
        allowedCount: 0,
      };
    }

    return {
      mode: 'wildcard',
      origin: '*',
      credentials: false,
      allowedCount: 0,
    };
  }

  const normalized = raw.trim();
  if (normalized === '*') {
    return {
      mode: 'wildcard',
      origin: '*',
      credentials: false,
      allowedCount: 0,
    };
  }

  const allowedOrigins = normalized
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (allowedOrigins.length <= 1) {
    const single = allowedOrigins[0] ?? normalized;
    return {
      mode: 'single',
      origin: single,
      credentials: true,
      allowedCount: 1,
    };
  }

  const allowedSet = new Set(allowedOrigins);

  const origin: CorsOptions['origin'] = (requestOrigin, callback) => {
    // Same-origin or non-browser requests have no Origin header.
    if (!requestOrigin) {
      return callback(null, true);
    }

    if (allowedSet.has(requestOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  };

  return {
    mode: 'multi',
    origin,
    credentials: true,
    allowedCount: allowedSet.size,
  };
}

const parsed = parseCorsOrigin(process.env.CORS_ORIGIN);

if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn(
    'Warning: CORS_ORIGIN not set — cross-origin requests are disabled in production. ' +
      'Set CORS_ORIGIN in your environment to allow frontend access.'
  );
}

console.info(
  `CORS configured: mode=${parsed.mode}, allowed_origins=${parsed.allowedCount}, credentials=${parsed.credentials}`
);

export const corsOptions: CorsOptions = {
  origin: parsed.origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: parsed.credentials,
  maxAge: 86400,
};

export { parseCorsOrigin };
