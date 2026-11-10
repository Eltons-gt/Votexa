import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Users } from 'lucide-react';
import { Organization } from '@votexa/shared';

export function OrganizationOverview({ organization }: { organization: Organization }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {organization.name}
          </CardTitle>
          <CardDescription>Slug: {organization.slug}</CardDescription>
        </div>
        <Badge variant="secondary">{organization.planId || 'ENTERPRISE'}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Multi-Tenant Scoped
          </span>
          <span>Created: {new Date(organization.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
