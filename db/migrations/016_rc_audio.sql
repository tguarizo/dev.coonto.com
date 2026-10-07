BEGIN;
ALTER TABLE coonto_audio_jobs ADD COLUMN IF NOT EXISTS generation_source TEXT NOT NULL DEFAULT 'crm' CHECK(generation_source IN ('crm','beta-script'));
ALTER TABLE coonto_audio_jobs ADD COLUMN IF NOT EXISTS work_slug TEXT NOT NULL DEFAULT 'o-alienista';
ALTER TABLE coonto_audio_jobs DROP CONSTRAINT IF EXISTS coonto_audio_jobs_scene_id_check;
ALTER TABLE coonto_audio_jobs DROP CONSTRAINT IF EXISTS coonto_audio_jobs_work_scene_check;
ALTER TABLE coonto_audio_jobs ADD CONSTRAINT coonto_audio_jobs_work_scene_check CHECK(
 (work_slug='o-alienista' AND scene_id ~ '^(s([0-9]|[1-3][0-9]|4[0-7])|c[1-4]|final)$') OR
 (work_slug='memorias-de-martha' AND scene_id ~ '^cap-([1-9]|1[0-2])(-i-[1-3]-(pre|r-[0-2]))?$') OR
 (work_slug='divina-comedia-canto-i' AND scene_id ~ '^mov-[1-6](-i-[1-3]-(pre|r-[0-2]))?$')
);
COMMIT;
