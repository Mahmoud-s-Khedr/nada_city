import {
  S3Client,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let _client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }
  return _client;
}

export interface PresignedUrlOptions {
  key: string;
  operation: 'put' | 'get';
  contentType?: string;
  expiresIn?: number;
}

export interface PresignedUrlResult {
  url: string;
  get_url: string;
  key: string;
  expiresIn: number;
}

function buildPublicObjectUrl(baseUrl: string, key: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${normalizedBase}/${encodedKey}`;
}

export async function generatePresignedUrl(
  options: PresignedUrlOptions,
): Promise<PresignedUrlResult> {
  const client = getS3Client();
  const bucket = env.S3_BUCKET;
  const expiresIn = Math.min(Math.max(options.expiresIn ?? 300, 1), 3600);

  let command;
  if (options.operation === 'put') {
    command = new PutObjectCommand({
      Bucket: bucket,
      Key: options.key,
      ContentType: options.contentType ?? 'application/octet-stream',
    });
  } else {
    command = new GetObjectCommand({
      Bucket: bucket,
      Key: options.key,
    });
  }

  const url = await getSignedUrl(client, command, { expiresIn });

  logger.info(
    { key: options.key, operation: options.operation, expiresIn },
    'Generated presigned S3 URL',
  );

  const get_url = buildPublicObjectUrl(env.S3_PUBLIC_BASE_URL, options.key);
  return { url, get_url, key: options.key, expiresIn };
}

/**
 * Delete objects that are owned by an account. The caller is responsible for
 * deriving keys only from records owned by that account.
 */
export async function deleteStoredObjects(keys: string[]): Promise<void> {
  const uniqueKeys = [...new Set(keys.filter((key) => key.length > 0))];
  if (uniqueKeys.length === 0) {
    return;
  }

  const client = getS3Client();
  for (let index = 0; index < uniqueKeys.length; index += 1000) {
    const batch = uniqueKeys.slice(index, index + 1000);
    const result = await client.send(new DeleteObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delete: {
        Objects: batch.map((Key) => ({ Key })),
        Quiet: true,
      },
    }));

    if (result.Errors && result.Errors.length > 0) {
      logger.warn({ errors: result.Errors }, 'Some account-owned storage objects could not be deleted');
    }
  }
}
