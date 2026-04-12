-- Cleanup legacy URL columns after bucket/path rollout is verified in production.
-- These columns were kept temporarily for backwards compatibility.

ALTER TABLE public.resume_verifications
    DROP COLUMN IF EXISTS raw_file_url;

ALTER TABLE public.resumes
    DROP COLUMN IF EXISTS raw_file_url;
