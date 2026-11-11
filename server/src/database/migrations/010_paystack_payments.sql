-- ============================================================================
-- Votexa Database Migration 010: Paystack Payment Gateway Integration
-- Features:
--   1. Enhances payment_transactions with gateway_reference, customer_email, and payment_channel
--   2. Adds performance and lookup indexes for Paystack checkout references and webhooks
-- ============================================================================

-- 1. Ensure columns exist on payment_transactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' AND column_name = 'gateway_reference'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN gateway_reference VARCHAR(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN customer_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' AND column_name = 'payment_channel'
    ) THEN
        ALTER TABLE payment_transactions ADD COLUMN payment_channel VARCHAR(50);
    END IF;
END $$;

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pay_tx_provider ON payment_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_pay_tx_gateway_ref ON payment_transactions(gateway_reference);
CREATE INDEX IF NOT EXISTS idx_pay_tx_provider_status ON payment_transactions(provider, status);

