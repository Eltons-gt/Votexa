-- ============================================================================
-- Votexa Database Migration 007: Organizer Payouts, Reservations & Audit Logs
-- Tables:
--   1. organization_payout_accounts (Saved disbursement destinations)
--   2. organizer_payouts (Payout request lifecycle & settlement records)
--   3. payout_reservations (Atomic fund reservation tracking)
--   4. payout_audit_logs (Immutable audit trail of review & settlement decisions)
-- ============================================================================

-- 1. Organization Payout Accounts
CREATE TABLE IF NOT EXISTS organization_payout_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- 'MPESA_B2C', 'BANK_TRANSFER'
    account_name VARCHAR(150) NOT NULL,
    account_identifier VARCHAR(100) NOT NULL, -- Phone 2547XXXXXXXX or Bank Account Number
    bank_name VARCHAR(150),
    swift_code VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payout_acc_org ON organization_payout_accounts(organization_id);

-- 2. Organizer Payouts
CREATE TABLE IF NOT EXISTS organizer_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payout_account_id UUID REFERENCES organization_payout_accounts(id) ON DELETE SET NULL,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    fee_cents BIGINT NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
    net_amount_cents BIGINT NOT NULL CHECK (net_amount_cents > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    method VARCHAR(50) NOT NULL, -- 'MPESA_B2C', 'BANK_TRANSFER'
    destination_details JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    -- Statuses: 'REQUESTED', 'RESERVED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'FAILED', 'CANCELLED'
    requested_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    settlement_evidence TEXT,
    settled_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    ledger_entry_group_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_payouts_org ON organizer_payouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_payouts_status ON organizer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_org_payouts_req_by ON organizer_payouts(requested_by);

-- 3. Payout Reservations (Strict 2-Phase Balance Reservation)
CREATE TABLE IF NOT EXISTS payout_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES organizer_payouts(id) ON DELETE CASCADE UNIQUE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RELEASED', 'SETTLED'
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payout_res_payout ON payout_reservations(payout_id);
CREATE INDEX IF NOT EXISTS idx_payout_res_acc ON payout_reservations(account_id);
CREATE INDEX IF NOT EXISTS idx_payout_res_org ON payout_reservations(organization_id);

-- 4. Payout Audit Logs
CREATE TABLE IF NOT EXISTS payout_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES organizer_payouts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    performed_by UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payout_audit_payout ON payout_audit_logs(payout_id);
CREATE INDEX IF NOT EXISTS idx_payout_audit_org ON payout_audit_logs(organization_id);

-- 5. Row Level Security Policies
ALTER TABLE organization_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_payout_accounts ON organization_payout_accounts;
CREATE POLICY tenant_isolation_payout_accounts ON organization_payout_accounts
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_organizer_payouts ON organizer_payouts;
CREATE POLICY tenant_isolation_organizer_payouts ON organizer_payouts
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_payout_reservations ON payout_reservations;
CREATE POLICY tenant_isolation_payout_reservations ON payout_reservations
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_payout_audit_logs ON payout_audit_logs;
CREATE POLICY tenant_isolation_payout_audit_logs ON payout_audit_logs
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

