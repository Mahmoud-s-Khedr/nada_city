import 'dotenv/config';
import process from 'node:process';
import { Client } from 'pg';

function fail(message: string): never {
  console.error(`[check:db] ${message}`);
  process.exit(1);
}

function info(message: string): void {
  console.log(`[check:db] ${message}`);
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    fail('DATABASE_URL is not set.');
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    fail('DATABASE_URL is not a valid URL.');
  }

  const dbUser = decodeURIComponent(parsed.username || '');
  const dbPassword = decodeURIComponent(parsed.password || '');
  const dbName = parsed.pathname.replace(/^\//, '');

  if (!dbUser || !dbPassword || !dbName) {
    fail('DATABASE_URL must contain user, password, and database name.');
  }

  const expectedUser = process.env.POSTGRES_USER;
  const expectedPassword = process.env.POSTGRES_PASSWORD;
  const expectedDb = process.env.POSTGRES_DB;
  const expectedHost = process.env.POSTGRES_HOST;
  const expectedPort = process.env.POSTGRES_PORT;

  if (expectedUser && expectedUser !== dbUser) {
    fail(`POSTGRES_USER mismatch: ${expectedUser} !== ${dbUser}`);
  }
  if (expectedPassword && expectedPassword !== dbPassword) {
    fail('POSTGRES_PASSWORD mismatch with DATABASE_URL password.');
  }
  if (expectedDb && expectedDb !== dbName) {
    fail(`POSTGRES_DB mismatch: ${expectedDb} !== ${dbName}`);
  }
  if (expectedHost && expectedHost !== parsed.hostname) {
    fail(`POSTGRES_HOST mismatch: ${expectedHost} !== ${parsed.hostname}`);
  }
  if (expectedPort && expectedPort !== String(parsed.port || 5432)) {
    fail(`POSTGRES_PORT mismatch: ${expectedPort} !== ${parsed.port || 5432}`);
  }

  info(`Attempting auth to ${parsed.hostname}:${parsed.port || '5432'}/${dbName} as ${dbUser}`);
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query('SELECT 1');
    info('Database authentication and connectivity check passed.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`Database check failed: ${detail}`);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  fail(`Unexpected failure: ${detail}`);
});
