import { createApp } from './app.js';
import type { Request, Response } from 'express';

const app = createApp();

export default function handler(req: Request, res: Response) {
  try {
    // If Vercel rewrote /api/* -> /api, restore original path from Vercel headers or query params
    if (req.url === '/api' || req.url?.startsWith('/api?')) {
      const matchedPath = req.headers['x-matched-path'] as string | undefined;
      const nowMatches = req.headers['x-now-route-matches'] as string | undefined;
      const origUrl = req.originalUrl;

      if (matchedPath && matchedPath.startsWith('/') && matchedPath !== '/api') {
        req.url = matchedPath;
      } else if (origUrl && origUrl.startsWith('/') && origUrl !== '/api') {
        req.url = origUrl;
      } else if (nowMatches) {
        const params = new URLSearchParams(nowMatches);
        const captured = params.get('1');
        if (captured) {
          req.url = `/api/${captured.replace(/^\/+/, '')}`;
        }
      }
    }

    // Handle direct health check without requiring Express response extensions
    if (req.url === '/health' || req.url === '/api/health' || req.url === '/api/v1/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          success: true,
          data: {
            status: 'UP',
            environment: process.env.NODE_ENV || 'production',
            timestamp: new Date().toISOString()
          }
        })
      );
      return;
    }

    return app(req, res);
  } catch (err) {
    console.error('[SERVERLESS_HANDLER_ERROR]', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'SERVERLESS_ERROR',
            message: 'Internal server error handling request'
          },
          timestamp: new Date().toISOString()
        })
      );
    }
  }
}
