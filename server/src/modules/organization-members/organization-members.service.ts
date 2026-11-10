import crypto from 'crypto';
import {
  OrganizationRole,
  OrganizationMember,
  OrganizationInvitation,
  UserProfile,
  SystemRole
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

interface StoredMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: UserProfile;
}

export class OrganizationMembersService {
  private static localMembers = new Map<string, StoredMember[]>([
    [
      'org-metro-uni',
      [
        {
          id: 'mem-1',
          organizationId: 'org-metro-uni',
          userId: 'usr-demo-owner',
          role: OrganizationRole.OWNER,
          joinedAt: '2026-01-01T00:00:00Z',
          user: {
            id: 'usr-demo-owner',
            email: 'user@university.edu',
            fullName: 'Dean Alexander Vance',
            systemRole: SystemRole.USER,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z'
          }
        },
        {
          id: 'mem-2',
          organizationId: 'org-metro-uni',
          userId: 'usr-demo-staff',
          role: OrganizationRole.STAFF,
          joinedAt: '2026-01-15T00:00:00Z',
          user: {
            id: 'usr-demo-staff',
            email: 'staff@university.edu',
            fullName: 'Sarah Jenkins',
            systemRole: SystemRole.USER,
            createdAt: '2026-01-15T00:00:00Z',
            updatedAt: '2026-01-15T00:00:00Z'
          }
        }
      ]
    ],
    [
      'org-starlight-col',
      [
        {
          id: 'mem-3',
          organizationId: 'org-starlight-col',
          userId: 'usr-admin-super',
          role: OrganizationRole.OWNER,
          joinedAt: '2026-02-01T00:00:00Z',
          user: {
            id: 'usr-admin-super',
            email: 'admin@votexa.io',
            fullName: 'Platform Super Admin',
            systemRole: SystemRole.SUPER_ADMIN,
            createdAt: '2026-02-01T00:00:00Z',
            updatedAt: '2026-02-01T00:00:00Z'
          }
        },
        {
          id: 'mem-4',
          organizationId: 'org-starlight-col',
          userId: 'usr-demo-owner',
          role: OrganizationRole.ADMIN,
          joinedAt: '2026-02-05T00:00:00Z',
          user: {
            id: 'usr-demo-owner',
            email: 'user@university.edu',
            fullName: 'Dean Alexander Vance',
            systemRole: SystemRole.USER,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z'
          }
        }
      ]
    ]
  ]);

  private static localInvitations = new Map<string, OrganizationInvitation>();

  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const list = OrganizationMembersService.localMembers.get(organizationId) || [];
    return list;
  }

  /**
   * Create an email invitation with secure token.
   */
  async inviteMember(
    inviterId: string,
    organizationId: string,
    email: string,
    role: OrganizationRole
  ): Promise<OrganizationInvitation> {
    const normalizedEmail = email.trim().toLowerCase();
    const members = await this.listMembers(organizationId);

    // Check if already a member
    if (members.some((m) => m.user?.email.toLowerCase() === normalizedEmail)) {
      throw new AppError(`User with email '${normalizedEmail}' is already a member of this workspace`, 409, 'ALREADY_A_MEMBER');
    }

    const token = `inv_${crypto.randomBytes(20).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString(); // 7 days

    const invitation: OrganizationInvitation = {
      id: `inv-${Date.now()}`,
      organizationId,
      email: normalizedEmail,
      role: role || OrganizationRole.STAFF,
      token,
      invitedBy: inviterId,
      expiresAt,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    OrganizationMembersService.localInvitations.set(token, invitation);
    return invitation;
  }

  /**
   * Accept an invitation using the token.
   */
  async acceptInvitation(userId: string, token: string, userProfile: UserProfile): Promise<OrganizationMember> {
    const invitation = OrganizationMembersService.localInvitations.get(token);
    if (!invitation || invitation.status !== 'PENDING') {
      throw new AppError('Invitation is invalid, revoked, or has already been accepted', 400, 'INVALID_INVITATION');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'EXPIRED';
      throw new AppError('Invitation link has expired', 400, 'EXPIRED_INVITATION');
    }

    const orgId = invitation.organizationId;
    let list = OrganizationMembersService.localMembers.get(orgId);
    if (!list) {
      list = [];
      OrganizationMembersService.localMembers.set(orgId, list);
    }

    const newMember: StoredMember = {
      id: `mem-${Date.now()}`,
      organizationId: orgId,
      userId,
      role: invitation.role,
      joinedAt: new Date().toISOString(),
      user: userProfile
    };

    list.push(newMember);
    invitation.status = 'ACCEPTED';

    return newMember;
  }

  /**
   * Update role of an existing member (Restricted to OWNER).
   */
  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    newRole: OrganizationRole
  ): Promise<OrganizationMember> {
    const list = OrganizationMembersService.localMembers.get(organizationId) || [];
    const member = list.find((m) => m.userId === targetUserId);

    if (!member) {
      throw new AppError('Target member not found in this organization', 404, 'MEMBER_NOT_FOUND');
    }

    // Protect last owner
    if (member.role === OrganizationRole.OWNER && newRole !== OrganizationRole.OWNER) {
      const ownerCount = list.filter((m) => m.role === OrganizationRole.OWNER).length;
      if (ownerCount <= 1) {
        throw new AppError('Cannot demote the only workspace Owner. Assign another Owner first.', 400, 'LAST_OWNER_PROTECTION');
      }
    }

    member.role = newRole;
    return member;
  }

  /**
   * Remove member from organization.
   */
  async removeMember(organizationId: string, targetUserId: string): Promise<void> {
    const list = OrganizationMembersService.localMembers.get(organizationId) || [];
    const idx = list.findIndex((m) => m.userId === targetUserId);

    if (idx === -1) {
      throw new AppError('Target member not found in this organization', 404, 'MEMBER_NOT_FOUND');
    }

    const target = list[idx];
    if (target && target.role === OrganizationRole.OWNER) {
      const ownerCount = list.filter((m) => m.role === OrganizationRole.OWNER).length;
      if (ownerCount <= 1) {
        throw new AppError('Cannot remove the only workspace Owner.', 400, 'LAST_OWNER_PROTECTION');
      }
    }

    list.splice(idx, 1);
  }
}

export const organizationMembersService = new OrganizationMembersService();
