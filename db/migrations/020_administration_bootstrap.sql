BEGIN;
-- A singleton receipt survives withdrawal of the initial administrator.
CREATE TABLE IF NOT EXISTS administration_bootstrap (
  singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  initial_user_id TEXT NOT NULL REFERENCES users(id),
  initial_email TEXT NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at TIMESTAMPTZ,
  retired_by TEXT REFERENCES users(id)
);
COMMIT;
