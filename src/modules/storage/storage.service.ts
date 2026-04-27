import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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
  key: string;
  expiresIn: number;
}

export async function generatePresignedUrl(
  options: PresignedUrlOptions,
): Promise<PresignedUrlResult> {
  const client = getS3Client();
  const bucket = env.S3_BUCKET;
  const expiresIn = Math.min(options.expiresIn ?? 300, 3600);

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

  return { url, key: options.key, expiresIn };
}
