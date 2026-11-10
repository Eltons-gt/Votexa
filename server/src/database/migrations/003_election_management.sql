-- ============================================================================
-- Votexa Database Migration 003: Comprehensive Election Management Foundation
-- Supports: Institutional Elections, Paid Competitions, Public Opinion Polls
-- Features: Positions, Candidates, Voter Rolls, Lifecycle, Settings & Audit Logs
-- ============================================================================

-- 1. Alter Elections Table for Categories & Certification
ALTER TABLE elections
    ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'INSTITUTIONAL',
    ADD COLUMN IF NOT EXISTS certified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS certified_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_elections_category ON elections(category);

-- 2. Election Settings
CREATE TABLE IF NOT EXISTS election_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL UNIQUE REFERENCES elections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    results_visibility VARCHAR(50) NOT NULL DEFAULT 'AFTER_CLOSE',
    allow_multiple_votes BOOLEAN NOT NULL DEFAULT FALSE,
    max_votes_per_voter INT NOT NULL DEFAULT 1,
    vote_price_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    require_voter_verification BOOLEAN NOT NULL DEFAULT TRUE,
    allowed_domains TEXT[] DEFAULT '{}',
    shuffle_candidate_order BOOLEAN NOT NULL DEFAULT FALSE,
    enable_real_time_tally BOOLEAN NOT NULL DEFAULT TRUE,
    custom_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_election_settings_election ON election_settings(election_id);
CREATE INDEX IF NOT EXISTS idx_election_settings_org ON election_settings(organization_id);

-- 3. Election Positions (Offices / Contests)
CREATE TABLE IF NOT EXISTS election_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    min_selections INT NOT NULL DEFAULT 1,
    max_selections INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_positions_election ON election_positions(election_id);
CREATE INDEX IF NOT EXISTS idx_positions_org ON election_positions(organization_id);

-- 4. Alter Candidates Table to Bind to Position
ALTER TABLE candidates
    ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES election_positions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS manifesto TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);

-- 5. Alter Voters Table for Roll & Eligibility
ALTER TABLE voters
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS eligibility_status VARCHAR(50) NOT NULL DEFAULT 'ELIGIBLE',
    ADD COLUMN IF NOT EXISTS eligibility_tag VARCHAR(100),
    ADD COLUMN IF NOT EXISTS votes_cast_count INT NOT NULL DEFAULT 0;

-- Create election_voters view for convenience & backward compatibility
CREATE OR REPLACE VIEW election_voters AS 
SELECT 
    id,
    organization_id,
    election_id,
    user_id,
    voter_code,
    email,
    phone,
    first_name,
    last_name,
    eligibility_status,
    eligibility_tag,
    has_voted,
    votes_cast_count,
    verified_at,
    created_at
FROM voters;

-- 6. Election Invitations
CREATE TABLE IF NOT EXISTS election_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    voter_id UUID REFERENCES voters(id) ON DELETE SET NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_election_invites_election ON election_invitations(election_id);
CREATE INDEX IF NOT EXISTS idx_election_invites_org ON election_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_election_invites_token ON election_invitations(token);

-- 7. Election Audit Logs
CREATE TABLE IF NOT EXISTS election_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_election_audit_election ON election_audit_logs(election_id);
CREATE INDEX IF NOT EXISTS idx_election_audit_org ON election_audit_logs(organization_id);

-- 8. Row Level Security Policies
ALTER TABLE election_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_election_settings ON election_settings;
CREATE POLICY tenant_isolation_election_settings ON election_settings
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_election_positions ON election_positions;
CREATE POLICY tenant_isolation_election_positions ON election_positions
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_election_invitations ON election_invitations;
CREATE POLICY tenant_isolation_election_invitations ON election_invitations
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_isolation_election_audit_logs ON election_audit_logs;
CREATE POLICY tenant_isolation_election_audit_logs ON election_audit_logs
    FOR ALL
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

