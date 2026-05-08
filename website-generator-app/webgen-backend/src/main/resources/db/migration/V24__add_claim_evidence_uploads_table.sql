-- Claim evidence upload staging table for manual user-submitted artifacts.
--
-- Purpose:
-- - capture upload metadata and lifecycle status before AI analysis finishes
-- - keep pending uploads out of deterministic claim_evidence_links scoring path
-- - support private object storage routing by provider/bucket/key

CREATE TABLE public.claim_evidence_uploads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    claim_id uuid NOT NULL,
    storage_provider text NOT NULL,
    storage_bucket text NOT NULL,
    storage_key text NOT NULL,
    original_file_name text NOT NULL,
    content_type text NOT NULL,
    file_size_bytes bigint NOT NULL,
    status text DEFAULT 'uploaded'::text NOT NULL,
    analysis_error text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT claim_evidence_uploads_pkey PRIMARY KEY (id),
    CONSTRAINT claim_evidence_uploads_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT claim_evidence_uploads_claim_profile_fkey
        FOREIGN KEY (claim_id, profile_id) REFERENCES public.claims(id, profile_id) ON DELETE CASCADE,
    CONSTRAINT claim_evidence_uploads_storage_provider_not_blank
        CHECK (btrim(storage_provider) <> ''::text),
    CONSTRAINT claim_evidence_uploads_storage_bucket_not_blank
        CHECK (btrim(storage_bucket) <> ''::text),
    CONSTRAINT claim_evidence_uploads_storage_key_not_blank
        CHECK (btrim(storage_key) <> ''::text),
    CONSTRAINT claim_evidence_uploads_original_file_name_not_blank
        CHECK (btrim(original_file_name) <> ''::text),
    CONSTRAINT claim_evidence_uploads_content_type_not_blank
        CHECK (btrim(content_type) <> ''::text),
    CONSTRAINT claim_evidence_uploads_file_size_nonnegative
        CHECK (file_size_bytes >= 0),
    CONSTRAINT claim_evidence_uploads_status_check
        CHECK (status = ANY (ARRAY[
            'uploaded'::text,
            'queued'::text,
            'analyzing'::text,
            'completed'::text,
            'failed'::text
        ])),
    CONSTRAINT claim_evidence_uploads_analysis_error_not_blank
        CHECK (analysis_error IS NULL OR btrim(analysis_error) <> ''::text),
    CONSTRAINT claim_evidence_uploads_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text),
    CONSTRAINT claim_evidence_uploads_storage_key_unique
        UNIQUE (profile_id, storage_provider, storage_bucket, storage_key)
);

CREATE INDEX claim_evidence_uploads_profile_id_idx
    ON public.claim_evidence_uploads USING btree (profile_id);

CREATE INDEX claim_evidence_uploads_claim_id_idx
    ON public.claim_evidence_uploads USING btree (claim_id);

CREATE INDEX claim_evidence_uploads_profile_claim_idx
    ON public.claim_evidence_uploads USING btree (profile_id, claim_id);

CREATE INDEX claim_evidence_uploads_profile_status_idx
    ON public.claim_evidence_uploads USING btree (profile_id, status);

CREATE INDEX claim_evidence_uploads_profile_created_at_idx
    ON public.claim_evidence_uploads USING btree (profile_id, created_at DESC);

ALTER TABLE public.claim_evidence_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own claim evidence uploads"
    ON public.claim_evidence_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own claim evidence uploads"
    ON public.claim_evidence_uploads
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own claim evidence uploads"
    ON public.claim_evidence_uploads
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own claim evidence uploads"
    ON public.claim_evidence_uploads
    FOR DELETE
    USING (auth.uid() = profile_id);

COMMENT ON TABLE public.claim_evidence_uploads IS
    'User-uploaded claim evidence artifacts staged for AI analysis before deterministic linking.';
COMMENT ON COLUMN public.claim_evidence_uploads.storage_provider IS
    'Object storage provider key (for example r2) to support future multi-provider migration.';
COMMENT ON COLUMN public.claim_evidence_uploads.storage_bucket IS
    'Storage bucket name used for the uploaded object.';
COMMENT ON COLUMN public.claim_evidence_uploads.storage_key IS
    'Provider object key/path for private retrieval during analysis.';
COMMENT ON COLUMN public.claim_evidence_uploads.status IS
    'Upload/analysis lifecycle status: uploaded, queued, analyzing, completed, failed.';
COMMENT ON COLUMN public.claim_evidence_uploads.analysis_error IS
    'Failure reason when analysis status is failed.';
