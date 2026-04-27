import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { Resend } from 'resend';

export interface TokenDeliveryPayload {
  email: string;
  token: string;
  kind: 'otp' | 'password-reset';
}

export interface TokenDeliveryProvider {
  send(payload: TokenDeliveryPayload): Promise<void>;
}

export class DevTokenDeliveryProvider implements TokenDeliveryProvider {
  async send(payload: TokenDeliveryPayload): Promise<void> {
    logger.info(payload, 'Token generated for delivery (dev mode)');
  }
}

export class ResendTokenDeliveryProvider implements TokenDeliveryProvider {
  private resend: Resend;

  constructor() {
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required in production');
    }
    this.resend = new Resend(apiKey);
  }

  async send(payload: TokenDeliveryPayload): Promise<void> {
    const subject = payload.kind === 'otp' ? 'Your OTP Code' : 'Password Reset Request';
    const html =
      payload.kind === 'otp'
        ? `<p>Your verification code is: <strong>${payload.token}</strong></p><p>This code expires in 10 minutes.</p>`
        : `<p>Click the link below to reset your password:</p><p><a href="#">${payload.token}</a></p><p>This link expires in 30 minutes.</p>`;

    const { error } = await this.resend.emails.send({
      from: env.FROM_EMAIL,
      to: payload.email,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend email failed: ${error.message}`);
    }

    logger.info({ email: payload.email, kind: payload.kind }, 'Email sent via Resend');
  }
}

export function createTokenDeliveryProvider(): TokenDeliveryProvider {
  if (env.NODE_ENV === 'production') {
    return new ResendTokenDeliveryProvider();
  }
  return new DevTokenDeliveryProvider();
}

export const tokenDeliveryProvider: TokenDeliveryProvider = createTokenDeliveryProvider();
