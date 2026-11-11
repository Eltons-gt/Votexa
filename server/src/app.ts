import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import apiRouter from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError, sendSuccess } from './utils/apiResponse.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.disable('x-powered-by');
  app.use(
    helmet({
      hidePoweredBy: false,
      contentSecurityPolicy: false
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id', 'X-Request-Id']
    })
  );

  // Body Parsing (with rawBody retention for webhook signature verification)
  app.use(
    express.json({
      limit: '2mb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Request ID & Context
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // Health Check Endpoints
  const handleHealth = (req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        status: 'UP',
        environment: config.env,
        timestamp: new Date().toISOString()
      },
      undefined,
      200,
      req.requestId
    );
  };

  app.get('/health', handleHealth);
  app.get('/api/health', handleHealth);
  app.get('/api/v1/health', handleHealth);
  app.get('/', (_req: Request, res: Response) => {
    res.json({ name: 'Votexa API', status: 'UP', version: '1.0.0' });
  });
  app.get('/api', (_req: Request, res: Response) => {
    res.json({ name: 'Votexa API', status: 'UP', version: '1.0.0' });
  });

  // Mount API Router (supports both /api/v1 and /api aliases)
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 Not Found Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
