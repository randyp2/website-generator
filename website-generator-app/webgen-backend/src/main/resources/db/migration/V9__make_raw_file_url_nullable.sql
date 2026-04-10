-- raw_file_url is no longer populated for new uploads.
-- New rows use raw_file_bucket + raw_file_path instead.

ALTER TABLE public.resume_verifications
    ALTER COLUMN raw_file_url DROP NOT NULL;

ALTER TABLE public.resumes
    ALTER COLUMN raw_file_url DROP NOT NULL;
