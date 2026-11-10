import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface ServerConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  corsOrigin: string;
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
  security: {
    rateLimitMax: number;
    rateLimitWindowMs: number;
  };
}

export const config: ServerConfig = {
  env: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'votexa',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
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
  security: {
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)
  }
};
