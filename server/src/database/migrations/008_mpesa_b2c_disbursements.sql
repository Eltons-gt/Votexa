-- ============================================================================
-- Votexa Database Migration 008: Safaricom Daraja M-Pesa B2C Disbursements
-- Tables:
--   1. mpesa_b2c_disbursements (Direct wallet disbursement execution & callbacks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mpesa_b2c_disbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES organizer_payouts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id VARCHAR(100) NOT NULL UNIQUE,
    originator_conversation_id VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    amount_kes NUMERIC(15, 2) NOT NULL CHECK (amount_kes > 0),
    command_id VARCHAR(50) NOT NULL DEFAULT 'BusinessPayment',
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED', -- 'INITIATED', 'SUCCESS', 'FAILED', 'TIMEOUT'
    transaction_id VARCHAR(100), -- Safaricom Receipt e.g. 'NLX88921KL'
    result_code INTEGER,
    result_desc TEXT,
    raw_result JSONB,
    dispatched_by UUID NOT NULL REFERENCES users(id),
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mpesa_b2c_payout ON mpesa_b2c_disbursements(payout_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_b2c_org ON mpesa_b2c_disbursements(organization_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_b2c_conv ON mpesa_b2c_disbursements(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_b2c_orig_conv ON mpesa_b2c_disbursements(originator_conversation_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_b2c_status ON mpesa_b2c_disbursements(status);

-- Row Level Security
ALTER TABLE mpesa_b2c_disbursements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_mpesa_b2c_disbursements ON mpesa_b2c_disbursements;
CREATE POLICY tenant_isolation_mpesa_b2c_disbursements ON mpesa_b2c_disbursements
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID);
