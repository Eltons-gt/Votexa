-- ============================================================================
-- Votexa Database Migration 006: Revenue Sharing & Double-Entry Financial Ledger
-- Features:
--   1. financial_accounts (Platform treasury, Organizer treasury, escrows)
--   2. financial_ledger_entries (Strict balanced double-entry accounting)
--   3. revenue_allocations (25/75 platform/organizer split immutable snapshot)
--   4. refunds (Reversals for full and partial refunds)
--   5. chargebacks (Dispute accounting and reserve protection)
-- ============================================================================

-- 1. Financial Accounts
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for platform accounts
    account_type VARCHAR(50) NOT NULL, -- 'PLATFORM_TREASURY', 'ORGANIZER_TREASURY', 'PROCESSING_FEES_ESCROW', 'RESERVE_ESCROW', 'VOTER_REFUND_POOL'
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    available_balance BIGINT NOT NULL DEFAULT 0,
    reserved_balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_org_type_currency UNIQUE NULLS NOT DISTINCT (organization_id, account_type, currency)
);

CREATE INDEX IF NOT EXISTS idx_fin_accounts_org ON financial_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_fin_accounts_type ON financial_accounts(account_type);

-- 2. Financial Ledger Entries (Double-Entry Balanced Batches)
CREATE TABLE IF NOT EXISTS financial_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_group_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    balance_after BIGINT NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- 'PAYMENT', 'COMMISSION', 'PROCESSING_FEE', 'DEDUCTION', 'REFUND', 'CHARGEBACK', 'PAYOUT'
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_group ON financial_ledger_entries(entry_group_id);
CREATE INDEX IF NOT EXISTS idx_ledger_account ON financial_ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_org ON financial_ledger_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON financial_ledger_entries(created_at);

-- 3. Revenue Allocations (Immutable 25/75 Commission Snapshot)
CREATE TABLE IF NOT EXISTS revenue_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    gross_amount_cents BIGINT NOT NULL CHECK (gross_amount_cents >= 0),
    processing_fee_cents BIGINT NOT NULL DEFAULT 0 CHECK (processing_fee_cents >= 0),
    approved_deduction_cents BIGINT NOT NULL DEFAULT 0 CHECK (approved_deduction_cents >= 0),
    distributable_amount_cents BIGINT NOT NULL CHECK (distributable_amount_cents >= 0),
    platform_rate_basis_points INT NOT NULL DEFAULT 4000, -- 40.00%
    platform_fee_cents BIGINT NOT NULL CHECK (platform_fee_cents >= 0),
    organiser_rate_basis_points INT NOT NULL DEFAULT 6000, -- 60.00%
    organiser_fee_cents BIGINT NOT NULL CHECK (organiser_fee_cents >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'ALLOCATED', -- 'ALLOCATED', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'DISPUTED'
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rev_alloc_payment ON revenue_allocations(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_rev_alloc_org ON revenue_allocations(organization_id);
CREATE INDEX IF NOT EXISTS idx_rev_alloc_election ON revenue_allocations(election_id);

-- 4. Refunds (Immutable Reversals)
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    revenue_allocation_id UUID NOT NULL REFERENCES revenue_allocations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    voter_code VARCHAR(100),
    type VARCHAR(20) NOT NULL DEFAULT 'FULL', -- 'PARTIAL', 'FULL'
    refund_amount_cents BIGINT NOT NULL CHECK (refund_amount_cents > 0),
    reversal_distributable_cents BIGINT NOT NULL DEFAULT 0,
    reversal_platform_cents BIGINT NOT NULL DEFAULT 0,
    reversal_organiser_cents BIGINT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED', -- 'REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED'
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ledger_entry_group_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_org ON refunds(organization_id);

-- 5. Chargebacks (Disputes)
CREATE TABLE IF NOT EXISTS chargebacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    revenue_allocation_id UUID NOT NULL REFERENCES revenue_allocations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dispute_amount_cents BIGINT NOT NULL CHECK (dispute_amount_cents > 0),
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNDER_REVIEW', -- 'UNDER_REVIEW', 'LOST', 'WON'
    ledger_entry_group_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chargebacks_org ON chargebacks(organization_id);

-- 6. Row Level Security Policies
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargebacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_financial_accounts ON financial_accounts;
CREATE POLICY tenant_isolation_financial_accounts ON financial_accounts
    USING (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_financial_ledger_entries ON financial_ledger_entries;
CREATE POLICY tenant_isolation_financial_ledger_entries ON financial_ledger_entries
    USING (organization_id IS NULL OR organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_revenue_allocations ON revenue_allocations;
CREATE POLICY tenant_isolation_revenue_allocations ON revenue_allocations
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_refunds ON refunds;
CREATE POLICY tenant_isolation_refunds ON refunds
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_chargebacks ON chargebacks;
CREATE POLICY tenant_isolation_chargebacks ON chargebacks
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

