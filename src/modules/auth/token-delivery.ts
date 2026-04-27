import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

export interface TokenDeliveryPayload {
  email: string;
  token: string;
  kind: 'otp' | 'password-reset';
}

export interface TokenDeliveryProvider {
  send(payload: TokenDeliveryPayload): Promise<void>;
}

class DevTokenDeliveryProvider implements TokenDeliveryProvider {
  async send(payload: TokenDeliveryPayload): Promise<void> {
    logger.info(payload, 'Token generated for delivery');
  }
}

class ProductionTokenDeliveryProvider implements TokenDeliveryProvider {
  async send(_payload: TokenDeliveryPayload): Promise<void> {
    throw new Error('Production token delivery provider is not implemented. Configure email/SMS delivery.');
  }
}

export const tokenDeliveryProvider: TokenDeliveryProvider =
  env.NODE_ENV === 'production'
    ? new ProductionTokenDeliveryProvider()
    : new DevTokenDeliveryProvider();
