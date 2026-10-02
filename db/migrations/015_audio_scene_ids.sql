BEGIN;
ALTER TABLE coonto_audio_jobs DROP CONSTRAINT IF EXISTS coonto_audio_jobs_scene_id_check;
ALTER TABLE coonto_audio_jobs ADD CONSTRAINT coonto_audio_jobs_scene_id_check CHECK(scene_id ~ '^(s([0-9]|[1-3][0-9]|4[0-7])|c[1-4]|final|cap-([1-9]|1[0-2])|mov-[1-6])$');
COMMIT;
