import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { UserOrganizationMembership } from '@votexa/shared';

export function OrganizationSelector({
  currentOrgId,
  memberships,
  onSelectOrg,
  onOpenOnboarding
}: {
  currentOrgId: string;
  memberships: UserOrganizationMembership[];
  onSelectOrg: (orgId: string) => void;
  onOpenOnboarding: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentMembership = memberships.find((m) => m.organization.id === currentOrgId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs bg-card hover:bg-muted/40 transition-colors shadow-sm"
      >
        <Building2 className="h-4 w-4 text-primary" />
        <div className="text-left">
          <div className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
            {currentMembership ? currentMembership.organization.name : 'Select Workspace'}
          </div>
        </div>
        {currentMembership && (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
            {currentMembership.role}
          </Badge>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-lg border bg-card p-2 shadow-xl z-50 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Switch Workspace ({memberships.length})
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {memberships.map((m) => {
              const isSelected = m.organization.id === currentOrgId;
              return (
                <div
                  key={m.organization.id}
                  onClick={() => {
                    onSelectOrg(m.organization.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-medium">{m.organization.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">slug: {m.organization.slug}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {m.role}
                    </Badge>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t mt-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs gap-1.5 justify-center h-8"
              onClick={() => {
                setIsOpen(false);
                onOpenOnboarding();
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Onboard New Organization
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
