BEGIN;
CREATE TABLE IF NOT EXISTS educational_activities (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL,
 classroom_id TEXT NOT NULL,
 created_by TEXT NOT NULL REFERENCES users(id),
 title TEXT NOT NULL CHECK(char_length(title) BETWEEN 2 AND 160),
 instructions TEXT NOT NULL CHECK(char_length(instructions) BETWEEN 2 AND 8000),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(organization_id,id),
 FOREIGN KEY(organization_id,classroom_id) REFERENCES classrooms(organization_id,id)
);
CREATE TABLE IF NOT EXISTS educational_submissions (
 organization_id TEXT NOT NULL,
 activity_id TEXT NOT NULL,
 student_id TEXT NOT NULL REFERENCES users(id),
 body TEXT NOT NULL CHECK(char_length(body) BETWEEN 1 AND 12000),
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 feedback TEXT CHECK(char_length(feedback) BETWEEN 1 AND 8000),
 feedback_by TEXT REFERENCES users(id),
 feedback_at TIMESTAMPTZ,
 PRIMARY KEY(activity_id,student_id),
 FOREIGN KEY(organization_id,activity_id) REFERENCES educational_activities(organization_id,id)
);
-- No copying from personal notes or personal reading progress.
CREATE INDEX IF NOT EXISTS idx_educational_activities_class ON educational_activities(organization_id,classroom_id,created_at);
COMMIT;
