import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

vi.mock('./storage.service.js', () => ({
  generatePresignedUrl: vi.fn(),
}));

const { app } = await import('../../app.js');

describe('storage routes', () => {
  let authToken: string;

  beforeEach(() => {
    authToken = jwt.sign({ sub: 'user-1', role: 'USER', email: 'test@example.com' }, env.JWT_SECRET);
    vi.clearAllMocks();
  });

  describe('POST /api/v1/storage/presigned-url', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/storage/presigned-url')
        .send({ filename: 'test.txt' });

      expect(res.status).toBe(401);
    });

    it('returns 422 with invalid body', async () => {
      const res = await request(app)
        .post('/api/v1/storage/presigned-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns a presigned PUT URL for authenticated users', async () => {
      const { generatePresignedUrl } = await import('./storage.service.js');
      vi.mocked(generatePresignedUrl).mockImplementation(async (opts) => ({
        url: `http://minio:9000/test-bucket/${opts.key}?X-Amz-Algorithm=AWS4-HMAC-SHA256`,
        key: opts.key,
        expiresIn: 300,
      }));

      const res = await request(app)
        .post('/api/v1/storage/presigned-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ filename: 'test.txt', operation: 'put' });

      expect(res.status).toBe(200);
      expect(res.body.data.url).toContain('test-bucket');
      expect(res.body.data.key).toMatch(/^test_[a-f0-9]{16}\.txt$/);
      expect(res.body.data.expiresIn).toBe(300);
      expect(generatePresignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(/^test_[a-f0-9]{16}\.txt$/),
          operation: 'put',
        }),
      );
    });

    it('returns a presigned GET URL when requested', async () => {
      const { generatePresignedUrl } = await import('./storage.service.js');
      vi.mocked(generatePresignedUrl).mockResolvedValueOnce({
        url: 'http://minio:9000/test-bucket/get_abc123.txt',
        key: 'get_abc123.txt',
        expiresIn: 300,
      });

      const res = await request(app)
        .post('/api/v1/storage/presigned-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ filename: 'get.txt', operation: 'get' });

      expect(res.status).toBe(200);
      expect(generatePresignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(/^get_[a-f0-9]{16}\.txt$/),
          operation: 'get',
        }),
      );
    });

    it('passes custom contentType to generatePresignedUrl', async () => {
      const { generatePresignedUrl } = await import('./storage.service.js');
      vi.mocked(generatePresignedUrl).mockResolvedValueOnce({
        url: 'http://minio:9000/test-bucket/img.png',
        key: 'img.png',
        expiresIn: 300,
      });

      await request(app)
        .post('/api/v1/storage/presigned-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ filename: 'img.png', contentType: 'image/png', operation: 'put' });

      expect(generatePresignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: 'image/png',
        }),
      );
    });

    it('sanitizes malicious filenames', async () => {
      const { generatePresignedUrl } = await import('./storage.service.js');

      await request(app)
        .post('/api/v1/storage/presigned-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ filename: '../../../etc/passwd' });

      const callArgs = vi.mocked(generatePresignedUrl).mock.calls[0][0];
      expect(callArgs.key).not.toContain('/etc/passwd');
      expect(callArgs.key).not.toContain('..');
      expect(callArgs.key).toMatch(/etc_passwd_[a-f0-9]{16}$/);
    });
  });
});
