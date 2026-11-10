-- ============================================================================
-- Votexa Database Migration 004: Voting Engine & Election-Specific Credit System
-- Features:
--   1. Voting Packages (Organiser-configurable credit bundles)
--   2. Independent Voter Wallets (Per voter and election, isolated)
--   3. Complete Wallet Transaction Ledger (PURCHASE, SPEND, REFUND, etc.)
--   4. One-Time Vote Authorizations (Strict ballot confidentiality separation)
--   5. Cryptographic Votes Ledger (Zero link to voter identity or wallet)
-- ============================================================================

-- 1. Voting Packages
CREATE TABLE IF NOT EXISTS voting_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voting_packages_election ON voting_packages(election_id);
CREATE INDEX IF NOT EXISTS idx_voting_packages_org ON voting_packages(organization_id);

-- 2. Voter Wallets (Strictly Election-Specific)
CREATE TABLE IF NOT EXISTS voter_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    voter_code VARCHAR(100) NOT NULL,
    credits_balance INT NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id, voter_code)
);

CREATE INDEX IF NOT EXISTS idx_voter_wallets_election ON voter_wallets(election_id);
CREATE INDEX IF NOT EXISTS idx_voter_wallets_code ON voter_wallets(voter_code);

-- 3. Wallet Transactions Ledger
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES voter_wallets(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- PURCHASE, SPEND, REFUND, ADJUSTMENT, EXPIRY
    credits_amount INT NOT NULL,
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    reference_id VARCHAR(255),
    description TEXT,
    is_mock_payment BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_election ON wallet_transactions(election_id);

-- 4. Vote Authorizations (One-Time Token Separating Identity from Ballot)
CREATE TABLE IF NOT EXISTS vote_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    position_id UUID REFERENCES election_positions(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    voter_hash VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    credits_allocated INT NOT NULL DEFAULT 1,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vote_auth_token ON vote_authorizations(token_hash);
CREATE INDEX IF NOT EXISTS idx_vote_auth_election ON vote_authorizations(election_id);
CREATE INDEX IF NOT EXISTS idx_vote_auth_voter ON vote_authorizations(election_id, voter_hash);

-- 5. Alter Votes Table to include position, candidate, weight & receipt
ALTER TABLE votes
    ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES election_positions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS vote_weight INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS receipt_code VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_votes_position ON votes(position_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_receipt ON votes(receipt_code);

-- 6. Row Level Security Policies
ALTER TABLE voting_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_authorizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_voting_packages ON voting_packages;
CREATE POLICY tenant_isolation_voting_packages ON voting_packages
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_voter_wallets ON voter_wallets;
CREATE POLICY tenant_isolation_voter_wallets ON voter_wallets
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_vote_auth ON vote_authorizations;
CREATE POLICY tenant_isolation_vote_auth ON vote_authorizations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

