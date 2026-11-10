import { useState } from 'react';
import {
  Shield,
  Vote,
  Users,
  UserCheck,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  LogOut,
  ExternalLink,
  PlusCircle,
  Check,
  Layers,
  Wallet
} from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  UserProfile,
  UserOrganizationMembership,
  OrganizationRole,
  PlatformRole,
  SystemRole
} from '@votexa/shared';

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  currentUser: UserProfile;
  memberships: UserOrganizationMembership[];
  activeOrgId: string;
  onSwitchOrg: (orgId: string) => void;
  onOpenOnboarding: () => void;
  onNavigateHome: () => void;
  onSignOut: () => void;
  walletBalanceCents?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  currentUser,
  memberships,
  activeOrgId,
  onSwitchOrg,
  onOpenOnboarding,
  onNavigateHome,
  onSignOut,
  walletBalanceCents = 145000,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const activeMembership =
    memberships.find((m) => m.organization.id === activeOrgId) || memberships[0];
  const activeOrg = activeMembership?.organization;
  const activeRole = activeMembership?.role || OrganizationRole.STAFF;

  const isSuperAdmin =
    currentUser.systemRole === SystemRole.SUPER_ADMIN ||
    currentUser.platformRoles?.includes(PlatformRole.SUPER_ADMIN) ||
    currentUser.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN);

  const formatKes = (cents: number) => {
    return `KES ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  };

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { id: 'voting', label: 'Cast Ballot', icon: Vote, badge: 'Live', badgeVariant: 'success' as const },
        { id: 'elections', label: 'Elections', icon: Layers, badge: 'Active' },
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'voters', label: 'Voters Register', icon: UserCheck }
      ]
    },
    {
      group: 'ORGANIZATION',
      items: [
        { id: 'members', label: 'Members & Roles', icon: Shield },
        {
          id: 'finance',
          label: 'Treasury & Payouts',
          icon: Wallet,
          badge: formatKes(walletBalanceCents),
          badgeVariant: 'secondary' as const
        },
        { id: 'settings', label: 'Workspace Settings', icon: Settings }
      ]
    },
    ...(isSuperAdmin
      ? [
          {
            group: 'SUPERVISION',
            items: [
              {
                id: 'admin',
                label: 'Platform Governance',
                icon: ShieldAlert,
                badge: 'Super Admin',
                badgeVariant: 'destructive' as const
              }
            ]
          }
        ]
      : [])
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* ===================================================================
            1. TOP LOGO & COLLAPSE TOGGLE
        =================================================================== */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="leading-none">
                <span className="font-extrabold text-lg text-white tracking-tight">VOTEXA</span>
                <span className="block text-[10px] text-blue-400 font-mono font-medium mt-0.5">
                  Multi-Tenant Engine
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ===================================================================
            2. ORGANIZATION SELECTOR DROPDOWN
        =================================================================== */}
        <div className="p-3 border-b border-slate-800/80 relative">
          <div
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className={`p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                    {activeOrg?.name || 'My Organization'}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">
                      {activeRole}
                    </span>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activeOrg?.planId || 'ENTERPRISE'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronDown
                className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                  showOrgDropdown ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>

          {/* Org Switching Menu Dropdown */}
          {showOrgDropdown && (
            <div className="absolute top-full left-3 right-3 mt-1.5 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl animate-in fade-in-50 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Workspace
              </div>
              {memberships.map((m) => {
                const isSelected = m.organization.id === activeOrgId;
                return (
                  <button
                    key={m.organization.id}
                    onClick={() => {
                      onSwitchOrg(m.organization.id);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-medium">{m.organization.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">{m.role}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowOrgDropdown(false);
                    onOpenOnboarding();
                  }}
                  className="w-full p-2 rounded-lg text-left text-xs text-blue-400 hover:bg-blue-600/10 flex items-center gap-2 font-medium"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Create New Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            3. GROUPED NAVIGATION ITEMS
        =================================================================== */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                  {group.group}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between overflow-hidden">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || 'outline'}
                              className={`text-[10px] px-1.5 py-0 border-0 ${
                                isActive ? 'bg-white/20 text-white' : ''
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ===================================================================
            4. FOOTER: USER PROFILE CARD & ACTIONS
        =================================================================== */}
        <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
          {/* Public Landing Shortcut */}
          <button
            onClick={onNavigateHome}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Public Landing Page"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            {!isCollapsed && <span>Public Landing</span>}
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => handleNavClick('profile')}
            className={`p-2 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 flex items-center transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser.fullName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {currentUser.email}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSignOut();
                }}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
