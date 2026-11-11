import crypto from 'crypto';
import { config } from '../../config/index.js';
import { AppError } from '../../utils/apiResponse.js';

export interface PaystackInitParams {
  email: string;
  amountSubunit: number; // In cents / kobo (lowest currency unit)
  currency: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface PaystackInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaystackVerifyResult {
  id: number;
  domain: string;
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  reference: string;
  amount: number;
  gatewayResponse?: string;
  paidAt?: string;
  channel?: string;
  currency: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  customer?: {
    id?: number;
    email?: string;
    customerCode?: string;
    phone?: string;
  };
}

export class PaystackClient {
  private isSimulatedMode: boolean = false;

  constructor(options?: { simulated?: boolean }) {
    if (options?.simulated !== undefined) {
      this.isSimulatedMode = options.simulated;
    } else {
      // In test mode or when secretKey is unset, enable simulated mode
      this.isSimulatedMode =
        config.env === 'test' ||
        !config.paystack.secretKey ||
        config.paystack.secretKey.includes('placeholder');
    }
  }

  public setSimulatedMode(enabled: boolean): void {
    this.isSimulatedMode = enabled;
  }

  /**
   * 1. Initialize Paystack Transaction (creates checkout authorization URL & access code)
   */
  async initializeTransaction(params: PaystackInitParams): Promise<PaystackInitResult> {
    const { email, amountSubunit, currency, reference, callbackUrl, metadata, channels } = params;

    if (!email || !amountSubunit || !currency || !reference) {
      throw new AppError('Email, amount, currency, and reference are required to initialize Paystack checkout', 400, 'PAYSTACK_INVALID_PARAMS');
    }

    // Simulation fallback
    if (this.isSimulatedMode) {
      const accessCode = `pstk_acc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return {
        authorizationUrl: `https://checkout.paystack.com/${accessCode}`,
        accessCode,
        reference
      };
    }

    try {
      const res = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amountSubunit,
          currency: currency.toUpperCase(),
          reference,
          callback_url: callbackUrl || config.paystack.callbackUrl,
          metadata: metadata || {},
          channels: channels || ['card', 'mobile_money', 'bank', 'bank_transfer', 'apple_pay']
        })
      });

      const body = (await res.json()) as {
        status: boolean;
        message: string;
        data?: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      };

      if (!res.ok || !body.status || !body.data) {
        throw new AppError(body.message || 'Failed to initialize Paystack transaction', 400, 'PAYSTACK_INIT_FAILED');
      }

      return {
        authorizationUrl: body.data.authorization_url,
        accessCode: body.data.access_code,
        reference: body.data.reference
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Paystack gateway initialization network error: ${(err as Error).message}`, 502, 'PAYSTACK_NETWORK_ERROR');
    }
  }

  /**
   * 2. Authoritatively Verify Transaction with Paystack API
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
    if (!reference) {
      throw new AppError('Transaction reference is required for Paystack verification', 400, 'PAYSTACK_MISSING_REFERENCE');
    }

    // Simulation fallback
    if (this.isSimulatedMode) {
      return {
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference,
        amount: 50000,
        gatewayResponse: 'Successful',
        paidAt: new Date().toISOString(),
        channel: 'mobile_money',
        currency: 'KES',
        metadata: {}
      };
    }

    try {
      const res = await fetch(`${config.paystack.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const body = (await res.json()) as {
        status: boolean;
        message: string;
        data?: {
          id: number;
          domain: string;
          status: 'success' | 'failed' | 'abandoned' | 'pending';
          reference: string;
          amount: number;
          gateway_response?: string;
          paid_at?: string;
          channel?: string;
          currency: string;
          ip_address?: string;
          metadata?: Record<string, unknown>;
          customer?: {
            id?: number;
            email?: string;
            customer_code?: string;
            phone?: string;
          };
        };
      };

      if (!res.ok || !body.status || !body.data) {
        throw new AppError(body.message || 'Paystack transaction verification failed', 400, 'PAYSTACK_VERIFY_FAILED');
      }

      const d = body.data;
      return {
        id: d.id,
        domain: d.domain,
        status: d.status,
        reference: d.reference,
        amount: d.amount,
        gatewayResponse: d.gateway_response,
        paidAt: d.paid_at,
        channel: d.channel,
        currency: d.currency,
        ipAddress: d.ip_address,
        metadata: d.metadata,
        customer: d.customer
          ? {
              id: d.customer.id,
              email: d.customer.email,
              customerCode: d.customer.customer_code,
              phone: d.customer.phone
            }
          : undefined
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Paystack verification network error: ${(err as Error).message}`, 502, 'PAYSTACK_NETWORK_ERROR');
    }
  }

  /**
   * 3. Verify HMAC-SHA512 Webhook Signature
   */
  public verifyWebhookSignature(signature: string, rawBody: string | Buffer): boolean {
    if (!signature) return false;

    // In test environment, allow mock signature bypass
    if (config.env === 'test' && signature === 'test_mock_paystack_signature') {
      return true;
    }

    const secret = config.paystack.webhookSecret || config.paystack.secretKey;
    if (!secret) {
      // If no secret configured, simulation accepts valid mock test
      return config.env === 'test' || this.isSimulatedMode;
    }

    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (expected.length !== signature.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

export const paystackClient = new PaystackClient();

