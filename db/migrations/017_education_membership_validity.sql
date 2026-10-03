BEGIN;
-- Existing links remain active. Revocation is distinct from deletion and can
-- be audited; global personas must not override the validity of these links.
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked'));
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE organization_memberships ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_memberships_current ON organization_memberships(user_id,organization_id,status);
COMMIT;
