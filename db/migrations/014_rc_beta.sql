BEGIN;
CREATE TABLE IF NOT EXISTS rc_learning_progress (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 work_slug TEXT NOT NULL CHECK(work_slug IN ('memorias-de-martha','divina-comedia-canto-i')),
 content_version TEXT NOT NULL,
 state_json JSONB NOT NULL,
 percent INTEGER NOT NULL CHECK(percent BETWEEN 0 AND 100),
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(user_id,work_slug)
);
CREATE TABLE IF NOT EXISTS rc_content_versions (
 id TEXT PRIMARY KEY,
 work_slug TEXT NOT NULL CHECK(work_slug IN ('memorias-de-martha','divina-comedia-canto-i')),
 content JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','published','archived')),
 created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 published_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 approved_at TIMESTAMPTZ,
 published_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS rc_one_published ON rc_content_versions(work_slug) WHERE status='published';
CREATE INDEX IF NOT EXISTS rc_version_history ON rc_content_versions(work_slug,created_at DESC);
COMMIT;
