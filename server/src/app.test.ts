import { describe, it, expect } from 'vitest';
import { AppError, sendSuccess, sendError } from './utils/apiResponse.js';
import { tenantContext } from './middleware/tenantContext.js';
import { Request, Response } from 'express';

describe('Votexa Server Foundation Unit Tests', () => {
  describe('AppError & Error Utilities', () => {
    it('should create an operational AppError with custom code and status', () => {
      const error = new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
      expect(error.message).toBe('Tenant not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('TENANT_NOT_FOUND');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ApiResponse Formatters', () => {
    it('sendSuccess should format standard success payload envelope', () => {
      let statusCode = 0;
      let jsonPayload: any = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (payload: any) => {
          jsonPayload = payload;
          return mockRes;
        }
      } as unknown as Response;

      sendSuccess(mockRes, { electionCount: 5 }, undefined, 200, 'req_123');

      expect(statusCode).toBe(200);
      expect(jsonPayload.success).toBe(true);
      expect(jsonPayload.data.electionCount).toBe(5);
      expect(jsonPayload.requestId).toBe('req_123');
      expect(jsonPayload.timestamp).toBeDefined();
    });

    it('sendError should format standard error payload envelope', () => {
      let statusCode = 0;
      let jsonPayload: any = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return mockRes;
        },
        json: (payload: any) => {
          jsonPayload = payload;
          return mockRes;
        }
      } as unknown as Response;

      sendError(
        mockRes,
        { code: 'UNAUTHORIZED', message: 'Token expired' },
        401,
        'req_456'
      );

      expect(statusCode).toBe(401);
      expect(jsonPayload.success).toBe(false);
      expect(jsonPayload.error.code).toBe('UNAUTHORIZED');
      expect(jsonPayload.error.message).toBe('Token expired');
      expect(jsonPayload.requestId).toBe('req_456');
    });
  });

  describe('TenantContext Middleware', () => {
    it('should attach tenant to request when X-Organization-Id is present', async () => {
      const mockReq = {
        headers: {
          'x-organization-id': 'org-uuid-123'
        },
        query: {},
        params: {}
      } as unknown as Request;

      let nextCalled = false;
      const mockRes = {} as Response;
      const middleware = tenantContext();

      await middleware(mockReq, mockRes, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(mockReq.tenant?.organizationId).toBe('org-uuid-123');
    });

    it('should pass AppError to next when tenant is required but missing', async () => {
      const mockReq = {
        headers: {},
        query: {},
        params: {}
      } as unknown as Request;

      const mockRes = {} as Response;
      const middleware = tenantContext({ required: true });

      let error: any = null;
      await middleware(mockReq, mockRes, (err?: any) => {
        error = err;
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('TENANT_CONTEXT_MISSING');
    });
  });
});
