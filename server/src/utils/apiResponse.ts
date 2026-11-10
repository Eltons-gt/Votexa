import { Response } from 'express';
import { ApiResponse, ApiErrorPayload, PaginationMeta } from '@votexa/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  meta?: PaginationMeta,
  statusCode = 200,
  requestId?: string
): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
    requestId
  };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  error: ApiErrorPayload,
  statusCode = 500,
  requestId?: string
): void {
  const payload: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId
  };
  res.status(statusCode).json(payload);
}

