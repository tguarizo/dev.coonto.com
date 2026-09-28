BEGIN;
ALTER TABLE commercial_settings
  ADD COLUMN IF NOT EXISTS free_work_slug TEXT NOT NULL DEFAULT 'o-alienista';
COMMIT;
