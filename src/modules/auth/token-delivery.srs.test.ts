import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('token-delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DevTokenDeliveryProvider', () => {
    it('logs the payload without throwing', async () => {
      vi.doMock('../../config/env.js', () => ({
        env: { NODE_ENV: 'development', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.doMock('../../config/logger.js', () => ({
        logger: { info: vi.fn(), error: vi.fn() },
      }));
      vi.resetModules();

      const { logger } = await import('../../config/logger.js');
      const { DevTokenDeliveryProvider } = await import('./token-delivery.js');
      const provider = new DevTokenDeliveryProvider();
      const payload = { email: 'test@example.com', token: '123456', kind: 'otp' as const };

      await expect(provider.send(payload)).resolves.toBeUndefined();
      expect(logger.info).toHaveBeenCalledWith(payload, expect.stringContaining('dev'));

      vi.doUnmock('../../config/env.js');
      vi.doUnmock('../../config/logger.js');
    });
  });

  describe('ResendTokenDeliveryProvider', () => {
    it('throws if RESEND_API_KEY is missing', async () => {
      vi.doMock('../../config/env.js', () => ({
        env: { FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.doMock('resend', () => ({
        Resend: vi.fn(function () { return {}; }),
      }));
      vi.resetModules();

      const { ResendTokenDeliveryProvider: Provider } = await import('./token-delivery.js');
      expect(() => new Provider()).toThrow('RESEND_API_KEY is required');

      vi.doUnmock('../../config/env.js');
      vi.doUnmock('resend');
    });

    it('sends OTP email via Resend', async () => {
      const mockSend = vi.fn().mockResolvedValueOnce({ error: null });
      vi.doMock('resend', () => ({
        Resend: vi.fn(function () {
          return { emails: { send: mockSend } };
        }),
      }));
      vi.doMock('../../config/env.js', () => ({
        env: { RESEND_API_KEY: 're_test_key', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.resetModules();

      const { ResendTokenDeliveryProvider: Provider } = await import('./token-delivery.js');
      const provider = new Provider();
      const payload = { email: 'user@example.com', token: '654321', kind: 'otp' as const };

      await provider.send(payload);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@nada.city',
        to: 'user@example.com',
        subject: 'Your OTP Code',
        html: expect.stringContaining('654321'),
      });

      vi.doUnmock('resend');
      vi.doUnmock('../../config/env.js');
    });

    it('sends password-reset email via Resend', async () => {
      const mockSend = vi.fn().mockResolvedValueOnce({ error: null });
      vi.doMock('resend', () => ({
        Resend: vi.fn(function () {
          return { emails: { send: mockSend } };
        }),
      }));
      vi.doMock('../../config/env.js', () => ({
        env: { RESEND_API_KEY: 're_test_key', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.resetModules();

      const { ResendTokenDeliveryProvider: Provider } = await import('./token-delivery.js');
      const provider = new Provider();
      const payload = { email: 'user@example.com', token: 'reset-token-uuid', kind: 'password-reset' as const };

      await provider.send(payload);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@nada.city',
        to: 'user@example.com',
        subject: 'Password Reset Request',
        html: expect.stringContaining('reset-token-uuid'),
      });

      vi.doUnmock('resend');
      vi.doUnmock('../../config/env.js');
    });

    it('throws when Resend returns an error', async () => {
      const mockSend = vi.fn().mockResolvedValueOnce({ error: { message: 'Invalid API key' } });
      vi.doMock('resend', () => ({
        Resend: vi.fn(function () {
          return { emails: { send: mockSend } };
        }),
      }));
      vi.doMock('../../config/env.js', () => ({
        env: { RESEND_API_KEY: 're_bad_key', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.resetModules();

      const { ResendTokenDeliveryProvider: Provider } = await import('./token-delivery.js');
      const provider = new Provider();
      const payload = { email: 'user@example.com', token: '123456', kind: 'otp' as const };

      await expect(provider.send(payload)).rejects.toThrow('Resend email failed: Invalid API key');

      vi.doUnmock('resend');
      vi.doUnmock('../../config/env.js');
    });
  });

  describe('createTokenDeliveryProvider', () => {
    it('returns Resend provider in production', async () => {
      vi.doMock('../../config/env.js', () => ({
        env: { NODE_ENV: 'production', RESEND_API_KEY: 're_test_key', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.doMock('resend', () => ({
        Resend: vi.fn(function () { return {}; }),
      }));
      vi.resetModules();

      const { createTokenDeliveryProvider: factory, ResendTokenDeliveryProvider } = await import('./token-delivery.js');
      const provider = factory();
      expect(provider).toBeInstanceOf(ResendTokenDeliveryProvider);

      vi.doUnmock('../../config/env.js');
      vi.doUnmock('resend');
    });

    it('returns Dev provider in development', async () => {
      vi.doMock('../../config/env.js', () => ({
        env: { NODE_ENV: 'development', RESEND_API_KEY: '', FROM_EMAIL: 'noreply@nada.city' },
      }));
      vi.resetModules();

      const { createTokenDeliveryProvider: factory, DevTokenDeliveryProvider } = await import('./token-delivery.js');
      const provider = factory();
      expect(provider).toBeInstanceOf(DevTokenDeliveryProvider);

      vi.doUnmock('../../config/env.js');
    });
  });
});
