import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface ServerConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  serverUrl?: string;
  corsOrigin: string | boolean;
  database: {
    url?: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password?: string;
    ssl: boolean;
    poolMax: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  jwt: {
    secret: string;
  };
  mpesa: {
    environment: 'sandbox' | 'production';
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: string;
    callbackUrl: string;
    b2cShortcode: string;
    b2cInitiatorName: string;
    b2cSecurityCredential: string;
    b2cResultUrl: string;
    b2cTimeoutUrl: string;
  };
  paystack: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    baseUrl: string;
    callbackUrl: string;
  };
  security: {
    rateLimitMax: number;
    rateLimitWindowMs: number;
  };
}

export const config: ServerConfig = {
  env: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || '5000'}`,
  corsOrigin: process.env.CORS_ORIGIN || true,
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'votexa',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl:
      process.env.DB_SSL === 'true' ||
      (process.env.DATABASE_URL?.includes('supabase') ?? false) ||
      (process.env.DATABASE_URL?.includes('sslmode=require') ?? false),
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10)
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'votexa-default-jwt-secret-minimum-32-characters'
  },
  mpesa: {
    environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    consumerKey: process.env.MPESA_CONSUMER_KEY || 'sandbox_consumer_key',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'sandbox_consumer_secret',
    passkey:
      process.env.MPESA_PASSKEY ||
      'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    shortcode: process.env.MPESA_SHORTCODE || '174379',
    callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://api.votexa.io/api/v1/webhooks/mpesa',
    b2cShortcode: process.env.MPESA_B2C_SHORTCODE || '600999',
    b2cInitiatorName: process.env.MPESA_B2C_INITIATOR_NAME || 'testapi',
    b2cSecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || 'sandbox_security_credential',
    b2cResultUrl: process.env.MPESA_B2C_RESULT_URL || 'https://api.votexa.io/api/v1/webhooks/mpesa/b2c-result',
    b2cTimeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || 'https://api.votexa.io/api/v1/webhooks/mpesa/b2c-timeout'
  },
  paystack: {
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_live_9090f5293424a38a4d847cc72daf35f811ed5154',
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || '',
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || 'https://votexa-nu.vercel.app/elections'
  },
  security: {
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)
  }
};
