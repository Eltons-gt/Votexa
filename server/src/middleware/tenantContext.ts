import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiResponse.js';

export function tenantContext(options: { required?: boolean } = { required: true }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Look for tenant identifier from header or query or route params
    const orgId =
      (req.headers['x-organization-id'] as string) ||
      (req.params.organizationId as string) ||
      (req.query.organizationId as string);

    if (!orgId) {
      if (options.required) {
        throw new AppError(
          'Tenant context is required. Provide X-Organization-Id header.',
          400,
          'TENANT_CONTEXT_MISSING'
        );
      }
      return next();
    }

    req.tenant = {
      organizationId: orgId
    };

    next();
  };
}
