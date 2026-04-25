import { logger } from '../../config/logger.js';

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

export const tokenDeliveryProvider: TokenDeliveryProvider = new DevTokenDeliveryProvider();
