import { UserProfile, OrganizationRole } from '@votexa/shared';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: UserProfile;
      tenant?: {
        organizationId: string;
        role?: OrganizationRole;
      };
    }
  }
}

export {};

