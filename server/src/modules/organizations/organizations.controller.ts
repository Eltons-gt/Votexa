import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { organizationsService } from './organizations.service.js';

export class OrganizationsController {
  async listUserOrganizations(req: Request, res: Response): Promise<void> {
    const orgs = await organizationsService.getUserOrganizations(req.user!.id);
    sendSuccess(res, orgs, undefined, 200, req.requestId);
  }

  async create(req: Request, res: Response): Promise<void> {
    const membership = await organizationsService.createOrganization(
      req.user!.id,
      req.body.name,
      req.body.slug
    );
    sendSuccess(res, membership, undefined, 201, req.requestId);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const orgId = (req.params.id as string) || req.tenant?.organizationId || '';
    const org = await organizationsService.getOrganization(orgId);
    sendSuccess(res, org, undefined, 200, req.requestId);
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    const orgId = (req.params.id as string) || req.tenant?.organizationId || '';
    const updated = await organizationsService.updateSettings(
      orgId,
      req.body.settings || {},
      req.body.name
    );
    sendSuccess(res, updated, undefined, 200, req.requestId);
  }

  async switchOrganization(req: Request, res: Response): Promise<void> {
    const result = await organizationsService.switchOrganization(
      req.user!.id,
      req.body.organizationId
    );
    sendSuccess(res, result, undefined, 200, req.requestId);
  }
}
