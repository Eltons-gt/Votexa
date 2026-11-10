import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { organizationMembersService } from './organization-members.service.js';

export class OrganizationMembersController {
  async list(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant!.organizationId;
    const members = await organizationMembersService.listMembers(orgId);
    sendSuccess(res, members, undefined, 200, req.requestId);
  }

  async invite(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant!.organizationId;
    const invitation = await organizationMembersService.inviteMember(
      req.user!.id,
      orgId,
      req.body.email,
      req.body.role
    );
    sendSuccess(res, invitation, undefined, 201, req.requestId);
  }

  async accept(req: Request, res: Response): Promise<void> {
    const member = await organizationMembersService.acceptInvitation(
      req.user!.id,
      req.body.token,
      req.user!
    );
    sendSuccess(res, member, undefined, 200, req.requestId);
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant!.organizationId;
    const targetUserId = (req.params.userId as string) || '';
    const member = await organizationMembersService.updateMemberRole(
      orgId,
      targetUserId,
      req.body.role
    );
    sendSuccess(res, member, undefined, 200, req.requestId);
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    const orgId = req.tenant!.organizationId;
    const targetUserId = (req.params.userId as string) || '';
    await organizationMembersService.removeMember(orgId, targetUserId);
    sendSuccess(res, { message: 'Member removed successfully' }, undefined, 200, req.requestId);
  }
}
