import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePresignedUrl, getS3Client } from './storage.service.js';

vi.mock('../../config/env.js', () => ({
  env: {
    S3_ENDPOINT: 'http://localhost:9000',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY_ID: 'test-access-key',
    S3_SECRET_ACCESS_KEY: 'test-secret-key',
    S3_BUCKET: 'test-bucket',
    S3_FORCE_PATH_STYLE: true,
  },
}));

vi.mock('../../config/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function () { return {}; }),
  GetObjectCommand: vi.fn(function (params) { return { ...params, _type: 'GetObjectCommand' }; }),
  PutObjectCommand: vi.fn(function (params) { return { ...params, _type: 'PutObjectCommand' }; }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://example.com/presigned-url'),
}));

describe('storage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getS3Client', () => {
    it('returns a singleton S3Client instance', () => {
      const client1 = getS3Client();
      const client2 = getS3Client();
      expect(client1).toBe(client2);
    });
  });

  describe('generatePresignedUrl', () => {
    it('generates a PUT presigned URL with default content type', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const result = await generatePresignedUrl({
        key: 'test-file.txt',
        operation: 'put',
      });

      expect(result.url).toBe('https://example.com/presigned-url');
      expect(result.key).toBe('test-file.txt');
      expect(result.expiresIn).toBe(300);
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ Bucket: 'test-bucket', Key: 'test-file.txt', ContentType: 'application/octet-stream' }),
        { expiresIn: 300 },
      );
    });

    it('generates a PUT presigned URL with custom content type and expiresIn', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const result = await generatePresignedUrl({
        key: 'image.png',
        operation: 'put',
        contentType: 'image/png',
        expiresIn: 600,
      });

      expect(result.url).toBe('https://example.com/presigned-url');
      expect(result.key).toBe('image.png');
      expect(result.expiresIn).toBe(600);
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ Bucket: 'test-bucket', Key: 'image.png', ContentType: 'image/png' }),
        { expiresIn: 600 },
      );
    });

    it('generates a GET presigned URL', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const result = await generatePresignedUrl({
        key: 'existing-file.pdf',
        operation: 'get',
      });

      expect(result.url).toBe('https://example.com/presigned-url');
      expect(result.key).toBe('existing-file.pdf');
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ Bucket: 'test-bucket', Key: 'existing-file.pdf' }),
        { expiresIn: 300 },
      );
    });

    it('caps expiresIn at 3600', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      await generatePresignedUrl({
        key: 'file.txt',
        operation: 'put',
        expiresIn: 9999,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 },
      );
    });
  });
});
