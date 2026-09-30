BEGIN;
CREATE TABLE IF NOT EXISTS coonto_audio_jobs (
 id TEXT PRIMARY KEY,
 scene_id TEXT NOT NULL CHECK(scene_id ~ '^s([0-9]|[1-3][0-9]|4[0-7])$'),
 segments JSONB NOT NULL,
 model TEXT NOT NULL,
 characters INTEGER NOT NULL CHECK(characters BETWEEN 1 AND 5000),
 requested_characters INTEGER NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'generating' CHECK(status IN ('generating','ready','published','failed')),
 error_message TEXT NOT NULL DEFAULT '',
 created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_scene ON coonto_audio_jobs(scene_id,created_at DESC);
COMMIT;
