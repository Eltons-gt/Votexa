-- ==============================================================================
-- Migration: 002_multi_tenant_auth.sql
-- Description: Multi-Tenant Roles, Invitations & PostgreSQL Row Level Security (RLS)
-- ==============================================================================

-- 1. Add password_hash and settings columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Platform Roles Table (Super Admin, Support Admin)
CREATE TABLE IF NOT EXISTS platform_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'SUPPORT_ADMIN'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_platform_roles_user ON platform_roles(user_id);

-- 3. Organization Invitations Table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF', -- 'OWNER', 'ADMIN', 'STAFF'
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);

-- 4. RLS Helper Functions (Session-scoped context)
CREATE OR REPLACE FUNCTION current_app_organization_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_organization_id', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_platform_super_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_roles pr
        WHERE pr.user_id = current_app_user_id()
          AND pr.role = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Enable Row Level Security (RLS) on Tenant Tables
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;

-- 6. Tenant Isolation Policies
-- Drop existing policies if already created
DROP POLICY IF EXISTS tenant_isolation_elections ON elections;
CREATE POLICY tenant_isolation_elections ON elections
    FOR ALL
    USING (
        organization_id = current_app_organization_id()
        OR is_platform_super_admin()
    );

DROP POLICY IF EXISTS tenant_isolation_voters ON voters;
CREATE POLICY tenant_isolation_voters ON voters
    FOR ALL
    USING (
        organization_id = current_app_organization_id()
        OR is_platform_super_admin()
    );

DROP POLICY IF EXISTS tenant_isolation_wallets ON wallets;
CREATE POLICY tenant_isolation_wallets ON wallets
    FOR ALL
    USING (
        organization_id = current_app_organization_id()
        OR is_platform_super_admin()
    );

DROP POLICY IF EXISTS tenant_isolation_ledger ON financial_ledger;
CREATE POLICY tenant_isolation_ledger ON financial_ledger
    FOR ALL
    USING (
        organization_id = current_app_organization_id()
        OR is_platform_super_admin()
    );
