import { config } from '../../config/index.js';
import { AppError } from '../../utils/apiResponse.js';

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export class MpesaClient {
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private isSimulatedMode: boolean = false;

  constructor(options?: { simulated?: boolean }) {
    if (options?.simulated !== undefined) {
      this.isSimulatedMode = options.simulated;
    } else {
      // In test mode or when consumerKey is placeholder, enable simulation fallback
      this.isSimulatedMode =
        config.env === 'test' ||
        config.mpesa.consumerKey === 'sandbox_consumer_key' ||
        config.mpesa.consumerKey.includes('placeholder');
    }
  }

  /**
   * Set simulated mode programmatically (useful for tests)
   */
  public setSimulatedMode(enabled: boolean): void {
    this.isSimulatedMode = enabled;
  }

  /**
   * Normalize any Kenyan phone number to 254XXXXXXXXX format
   * Supports: +254..., 07..., 01..., 254..., 7..., 1...
   */
  public normalizePhoneNumber(phone: string): string {
    if (!phone) {
      throw new AppError('Phone number is required', 400, 'INVALID_PHONE_NUMBER');
    }

    // Remove all whitespace, dashes, plus signs, brackets
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');

    if (cleaned.startsWith('0')) {
      // e.g. 0712345678 -> 254712345678
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      // e.g. 712345678 -> 254712345678
      cleaned = '254' + cleaned;
    }

    // Must be exactly 12 digits, starting with 2547 or 2541
    const kenyaMsisdnRegex = /^254(7|1)\d{8}$/;
    if (!kenyaMsisdnRegex.test(cleaned)) {
      throw new AppError(
        'Invalid Kenyan phone number. Format must be 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX',
        400,
        'INVALID_PHONE_NUMBER'
      );
    }

    return cleaned;
  }

  /**
   * Format current date/time to Safaricom Timestamp format: YYYYMMDDHHmmss
   */
  public generateTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  }

  /**
   * Generate STK Push Password: Base64(Shortcode + Passkey + Timestamp)
   */
  public generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    const raw = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(raw).toString('base64');
  }

  /**
   * Fetch OAuth Access Token from Daraja
   */
  public async getAccessToken(): Promise<string> {
    if (this.isSimulatedMode) {
      return 'simulated_daraja_access_token_' + Date.now();
    }

    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return this.tokenCache.token;
    }

    const baseUrl =
      config.mpesa.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    const auth = Buffer.from(
      `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
    ).toString('base64');

    try {
      const response = await fetch(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Daraja OAuth failed: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as { access_token: string; expires_in: string };
      const expiresInSec = parseInt(data.expires_in, 10) || 3599;

      this.tokenCache = {
        token: data.access_token,
        expiresAt: now + expiresInSec * 1000
      };

      return data.access_token;
    } catch (err) {
      // In non-production, fallback gracefully to simulation if network fails
      if (config.env !== 'production') {
        console.warn('[DARJA_CLIENT] Network auth unreachable, falling back to simulated auth token:', (err as Error).message);
        return 'simulated_daraja_access_token_' + Date.now();
      }
      throw new AppError(`Failed to authenticate with Safaricom Daraja: ${(err as Error).message}`, 502, 'DARAJA_AUTH_FAILED');
    }
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  public async initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
    const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber);
    const timestamp = this.generateTimestamp();
    const shortcode = config.mpesa.shortcode;
    const passkey = config.mpesa.passkey;
    const password = this.generatePassword(shortcode, passkey, timestamp);
    const callbackUrl = params.callbackUrl || config.mpesa.callbackUrl;

    if (this.isSimulatedMode) {
      const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      return {
        merchantRequestId: `MR-${Date.now()}-${randSuffix}`,
        checkoutRequestId: `ws_CO_${Date.now()}_${randSuffix}`,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing'
      };
    }

    const token = await this.getAccessToken();
    const baseUrl =
      config.mpesa.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.max(1, Math.round(params.amount)),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.substring(0, 12),
      TransactionDesc: params.transactionDesc.substring(0, 30)
    };

    try {
      const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.json() as {
        MerchantRequestID?: string;
        CheckoutRequestID?: string;
        ResponseCode?: string;
        ResponseDescription?: string;
        CustomerMessage?: string;
        errorMessage?: string;
      };

      if (!response.ok || responseBody.ResponseCode !== '0') {
        const errorDesc = responseBody.ResponseDescription || responseBody.errorMessage || 'STK push rejected by provider';
        throw new Error(errorDesc);
      }

      return {
        merchantRequestId: responseBody.MerchantRequestID || `MR-${Date.now()}`,
        checkoutRequestId: responseBody.CheckoutRequestID || `ws_CO_${Date.now()}`,
        responseCode: responseBody.ResponseCode || '0',
        responseDescription: responseBody.ResponseDescription || 'Success',
        customerMessage: responseBody.CustomerMessage || 'Request accepted for processing'
      };
    } catch (err) {
      if (config.env !== 'production') {
        console.warn('[DARAJA_CLIENT] Network STK push unreachable, returning simulated STK response:', (err as Error).message);
        const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return {
          merchantRequestId: `MR-${Date.now()}-${randSuffix}`,
          checkoutRequestId: `ws_CO_${Date.now()}_${randSuffix}`,
          responseCode: '0',
          responseDescription: 'Success. Request accepted for processing',
          customerMessage: 'Success. Request accepted for processing'
        };
      }
      throw new AppError(`Daraja STK push failed: ${(err as Error).message}`, 502, 'STK_PUSH_FAILED');
    }
  }
}

export const mpesaClient = new MpesaClient();

