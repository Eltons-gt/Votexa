import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/apiResponse.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  // Operational AppError
  if (err instanceof AppError) {
    sendError(
      res,
      {
        code: err.code,
        message: err.message,
        details: err.details as Record<string, unknown> | undefined,
        stack: config.env === 'development' ? err.stack : undefined
      },
      err.statusCode,
      requestId
    );
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));

    sendError(
      res,
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input payload provided',
        details: formattedErrors
      },
      400,
      requestId
    );
    return;
  }

  // Unhandled / system error
  console.error('[UNHANDLED_ERROR]', err);
  sendError(
    res,
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.env === 'production' ? 'An unexpected internal error occurred' : err.message,
      stack: config.env === 'development' ? err.stack : undefined
    },
    500,
    requestId
  );
}
