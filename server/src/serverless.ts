import { createApp } from './app.js';
import type { Request, Response } from 'express';

const app = createApp();

export default function handler(req: Request, res: Response) {
  // If Vercel rewrote the path to /api, restore the original path from headers or originalUrl
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-now-route-matches'] as string) ||
    req.originalUrl;

  if (matchedPath && matchedPath.startsWith('/') && req.url === '/api') {
    req.url = matchedPath;
  }

  // Handle direct health check
  if (req.url === '/health' || req.url === '/api/health' || req.url === '/api/v1/health') {
    return res.status(200).json({
      success: true,
      data: {
        status: 'UP',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
      }
    });
  }

  return app(req, res);
}
