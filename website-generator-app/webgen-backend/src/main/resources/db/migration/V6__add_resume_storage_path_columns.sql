-- Phase 1: move resume storage metadata from URL-only to bucket/path fields.
-- Keep raw_file_url for backwards compatibility during the rollout.

ALTER TABLE public.resumes
    ADD COLUMN IF NOT EXISTS raw_file_bucket text;

ALTER TABLE public.resumes
    ADD COLUMN IF NOT EXISTS raw_file_path text;

-- Backfill from canonical Supabase public/signed storage URLs:
--   /storage/v1/object/public/<bucket>/<path>
--   /storage/v1/object/sign/<bucket>/<path>?token=...
UPDATE public.resumes
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
UPDATE public.resumes
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
        WHERE conname = 'resumes_raw_file_path_requires_bucket'
          AND conrelid = 'public.resumes'::regclass
    ) THEN
        ALTER TABLE public.resumes
            ADD CONSTRAINT resumes_raw_file_path_requires_bucket
            CHECK (raw_file_path IS NULL OR raw_file_bucket IS NOT NULL);
    END IF;
END $$;

-- Enforce one resume row per portfolio when existing data is clean.
-- If duplicates exist in an environment, the migration will continue and log a notice.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'resumes_portfolio_id_key'
          AND conrelid = 'public.resumes'::regclass
    ) THEN
        RETURN;
    END IF;

    IF EXISTS (
        SELECT portfolio_id
        FROM public.resumes
        GROUP BY portfolio_id
        HAVING count(*) > 1
    ) THEN
        RAISE NOTICE 'Skipping resumes_portfolio_id_key; duplicate portfolio_id rows exist in public.resumes.';
        RETURN;
    END IF;

    ALTER TABLE public.resumes
        ADD CONSTRAINT resumes_portfolio_id_key UNIQUE (portfolio_id);
END $$;
