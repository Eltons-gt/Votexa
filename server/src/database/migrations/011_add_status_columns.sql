-- ==============================================================================
-- Migration: 011_add_status_columns.sql
-- Description: Add status column to organizations and users
-- ==============================================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

