BEGIN;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_kind TEXT NOT NULL DEFAULT 'registered';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
-- Existing business roles and institutional links are preserved. Guest is an
-- account classification, not an administrative permission.
COMMIT;
