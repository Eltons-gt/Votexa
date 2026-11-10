-- ============================================================================
-- Votexa Database Migration 005: M-Pesa Payment Integration & Reconciliations
-- Tables:
--   1. payment_transactions (Core ledger of payment attempts, statuses, receipts)
--   2. payment_provider_events (Raw immutable webhook payload audit store)
--   3. payment_reconciliations (Discrepancy and audit records)
--   4. idempotency_records (Anti-replay and double-crediting protection)
-- ============================================================================

-- 1. Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES voting_packages(id) ON DELETE CASCADE,
    voter_code VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'MPESA', -- 'MPESA', 'STRIPE', 'MOCK'
    amount_cents INT NOT NULL CHECK (amount_cents >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    phone_number VARCHAR(20),
    merchant_request_id VARCHAR(100) NOT NULL,
    checkout_request_id VARCHAR(100) NOT NULL UNIQUE,
    mpesa_receipt_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'RECONCILED'
    result_code INT,
    result_desc TEXT,
    credits_issued BOOLEAN NOT NULL DEFAULT FALSE,
    credits_issued_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pay_tx_org ON payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_pay_tx_election ON payment_transactions(election_id);
CREATE INDEX IF NOT EXISTS idx_pay_tx_voter ON payment_transactions(election_id, voter_code);
CREATE INDEX IF NOT EXISTS idx_pay_tx_checkout ON payment_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_pay_tx_receipt ON payment_transactions(mpesa_receipt_number);
CREATE INDEX IF NOT EXISTS idx_pay_tx_status ON payment_transactions(status);

-- 2. Payment Provider Events (Raw immutable event log)
CREATE TABLE IF NOT EXISTS payment_provider_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'MPESA',
    event_type VARCHAR(100) NOT NULL,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pay_events_payment ON payment_provider_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_pay_events_provider ON payment_provider_events(provider);

-- 3. Payment Reconciliations (Discrepancy resolution & auditing)
CREATE TABLE IF NOT EXISTS payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    reconciled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCREPANCY_FLAGGED', -- 'RESOLVED', 'DISCREPANCY_FLAGGED', 'MANUAL_REVIEW'
    discrepancy_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pay_recon_payment ON payment_reconciliations(payment_id);

-- 4. Idempotency Records (Guarantee exact-once processing)
CREATE TABLE IF NOT EXISTS idempotency_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_records(key);

-- 5. Row Level Security Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_provider_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_records ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
DROP POLICY IF EXISTS tenant_isolation_payment_transactions ON payment_transactions;
CREATE POLICY tenant_isolation_payment_transactions ON payment_transactions
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_payment_provider_events ON payment_provider_events;
CREATE POLICY tenant_isolation_payment_provider_events ON payment_provider_events
    USING (TRUE); -- Managed securely by webhook service & platform role

DROP POLICY IF EXISTS tenant_isolation_idempotency_records ON idempotency_records;
CREATE POLICY tenant_isolation_idempotency_records ON idempotency_records
    USING (TRUE); -- System-level deduplication table

