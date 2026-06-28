import { describe, expect, it, vi } from 'vitest';

describe('storage.service Garage compatibility', () => {
  it('does not include SDK-managed checksum query params in presigned PUT URLs', async () => {
    vi.doMock('../../config/env.js', () => ({
      env: {
        S3_ENDPOINT: 'https://s3.example.com',
        S3_REGION: 'garage',
        S3_ACCESS_KEY_ID: 'test-access-key',
        S3_SECRET_ACCESS_KEY: 'test-secret-key',
        S3_BUCKET: 'test-bucket',
        S3_PUBLIC_BASE_URL: 'https://files.example.com',
        S3_FORCE_PATH_STYLE: true,
      },
    }));
    vi.doMock('../../config/logger.js', () => ({
      logger: { info: vi.fn(), error: vi.fn() },
    }));
    vi.resetModules();

    const { generatePresignedUrl } = await import('./storage.service.js');
    const result = await generatePresignedUrl({
      key: 'garage-upload.txt',
      operation: 'put',
      contentType: 'text/plain',
    });

    const params = new URL(result.url).searchParams;
    expect(params.has('x-amz-checksum-crc32')).toBe(false);
    expect(params.has('x-amz-sdk-checksum-algorithm')).toBe(false);
    expect(params.has('x-amz-checksum-mode')).toBe(false);

    vi.doUnmock('../../config/env.js');
    vi.doUnmock('../../config/logger.js');
  });
});
