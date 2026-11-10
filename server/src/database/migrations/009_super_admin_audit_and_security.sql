-- ============================================================================
-- Votexa Database Migration 009: Super Admin Governance, Audit & Security Infrastructure
-- Tables:
--   1. platform_audit_logs (Tamper-evident, sanitized audit log for all system events)
--   2. platform_security_events (Security, rate-limit, and authorization breach tracker)
--   3. platform_commission_history (Immutable audit log of SaaS commission rate updates)
-- ============================================================================

-- 1. Platform Audit Logs
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    request_reference VARCHAR(100),
    ip_address VARCHAR(45),
    before_state JSONB,
    after_state JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_audit_actor ON platform_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_action ON platform_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_platform_audit_resource ON platform_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_org ON platform_audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_created ON platform_audit_logs(created_at DESC);

-- 2. Platform Security Events
CREATE TABLE IF NOT EXISTS platform_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'UNAUTHORIZED_ADMIN_ATTEMPT', 'CROSS_TENANT_VIOLATION', 'DUTY_SEPARATION_VIOLATION', 'RATE_LIMIT_EXCEEDED', 'LOGIN_FAILED'
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    ip_address VARCHAR(45),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sec_events_type ON platform_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sec_events_severity ON platform_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_sec_events_created ON platform_security_events(created_at DESC);

-- 3. Platform Commission History
CREATE TABLE IF NOT EXISTS platform_commission_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_rate_basis_points INTEGER NOT NULL CHECK (platform_rate_basis_points >= 0 AND platform_rate_basis_points <= 10000),
    organiser_rate_basis_points INTEGER NOT NULL CHECK (organiser_rate_basis_points >= 0 AND organiser_rate_basis_points <= 10000),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure updated_by is nullable for system/seed updates if table already existed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'platform_commission_history' AND column_name = 'updated_by' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE platform_commission_history ALTER COLUMN updated_by DROP NOT NULL;
    END IF;
END $$;

-- Seed Initial Commission Rate (4000 / 6000 basis points)
INSERT INTO platform_commission_history (
    platform_rate_basis_points,
    organiser_rate_basis_points,
    updated_by,
    reason
)
SELECT 
    4000, 
    6000, 
    (SELECT id FROM users WHERE system_role = 'SUPER_ADMIN' LIMIT 1), 
    'Initial platform commission policy configuration'
WHERE NOT EXISTS (SELECT 1 FROM platform_commission_history);

-- 4. Audit Log Immutability Protection Rules
-- Ordinary application operations must never modify or delete audit records.
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit records are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_update ON platform_audit_logs;
CREATE TRIGGER trg_prevent_audit_update
    BEFORE UPDATE OR DELETE ON platform_audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS trg_prevent_sec_update ON platform_security_events;
CREATE TRIGGER trg_prevent_sec_update
    BEFORE UPDATE OR DELETE ON platform_security_events
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

