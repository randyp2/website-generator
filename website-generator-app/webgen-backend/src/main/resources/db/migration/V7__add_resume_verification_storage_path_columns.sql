-- Phase 1: move resume_verifications storage metadata from URL-only to bucket/path fields.
-- Keep raw_file_url for backwards compatibility during the rollout.

ALTER TABLE public.resume_verifications
    ADD COLUMN IF NOT EXISTS raw_file_bucket text;

ALTER TABLE public.resume_verifications
    ADD COLUMN IF NOT EXISTS raw_file_path text;

-- Backfill from canonical Supabase public/signed storage URLs:
--   /storage/v1/object/public/<bucket>/<path>
--   /storage/v1/object/sign/<bucket>/<path>?token=...
UPDATE public.resume_verifications
SET
    raw_file_bucket = COALESCE(
        raw_file_bucket,
        NULLIF(
            substring(raw_file_url FROM '/storage/v1/object/(?:public|sign)/([^/?#]+)'),
            ''
        )
    ),
    raw_file_path = COALESCE(
        raw_file_path,
        NULLIF(
            regexp_replace(
                split_part(
                    substring(raw_file_url FROM '/storage/v1/object/(?:public|sign)/[^/]+/(.+)$'),
                    '?',
                    1
                ),
                '^/+',
                ''
            ),
            ''
        )
    )
WHERE raw_file_url IS NOT NULL
  AND (raw_file_bucket IS NULL OR raw_file_path IS NULL);

-- Backfill legacy rows where raw_file_url may already be a storage path.
-- Current upload route uses bucket "portfolio_uploads".
UPDATE public.resume_verifications
SET
    raw_file_bucket = COALESCE(raw_file_bucket, 'portfolio_uploads'),
    raw_file_path = COALESCE(raw_file_path, NULLIF(raw_file_url, ''))
WHERE raw_file_url IS NOT NULL
  AND raw_file_url !~ '^[a-z]+://'
  AND (raw_file_bucket IS NULL OR raw_file_path IS NULL);

-- If a path exists, bucket must also exist.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'resume_verifications_raw_file_path_requires_bucket'
          AND conrelid = 'public.resume_verifications'::regclass
    ) THEN
        ALTER TABLE public.resume_verifications
            ADD CONSTRAINT resume_verifications_raw_file_path_requires_bucket
            CHECK (raw_file_path IS NULL OR raw_file_bucket IS NOT NULL);
    END IF;
END $$;
