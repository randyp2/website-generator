-- Makes verification evidence retractable and asynchronous jobs durable.

ALTER TABLE public.claims DROP CONSTRAINT claims_status_check;
ALTER TABLE public.claims
    ADD CONSTRAINT claims_status_check CHECK (status = ANY (ARRAY[
        'pending'::text,
        'user_confirmed'::text,
        'rejected'::text,
        'needs_evidence'::text,
        'corroborated'::text,
        'verified'::text
    ]));

ALTER TABLE public.evidence
    ADD COLUMN source_upload_id uuid,
    ADD CONSTRAINT evidence_source_upload_id_fkey
        FOREIGN KEY (source_upload_id) REFERENCES public.claim_evidence_uploads(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX evidence_source_upload_id_key
    ON public.evidence (source_upload_id)
    WHERE source_upload_id IS NOT NULL;

UPDATE public.evidence
SET source_upload_id = (metadata ->> 'uploadId')::uuid
WHERE provider = 'manual_upload'
  AND metadata ? 'uploadId'
  AND (metadata ->> 'uploadId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

CREATE TABLE public.asset_verification_jobs (
    id uuid NOT NULL PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    claim_id uuid NOT NULL,
    upload_id uuid NOT NULL REFERENCES public.claim_evidence_uploads(id) ON DELETE CASCADE,
    status text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    CONSTRAINT asset_verification_jobs_claim_profile_fkey
        FOREIGN KEY (claim_id, profile_id) REFERENCES public.claims(id, profile_id) ON DELETE CASCADE,
    CONSTRAINT asset_verification_jobs_status_check
        CHECK (status = ANY (ARRAY['queued', 'processing', 'completed', 'failed'])),
    CONSTRAINT asset_verification_jobs_attempts_check
        CHECK (attempt_count >= 0 AND max_attempts > 0),
    CONSTRAINT asset_verification_jobs_upload_key UNIQUE (upload_id)
);

CREATE INDEX asset_verification_jobs_status_updated_idx
    ON public.asset_verification_jobs (status, updated_at);

CREATE TABLE public.verification_outbox (
    id uuid NOT NULL PRIMARY KEY,
    aggregate_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    available_at timestamp with time zone DEFAULT now() NOT NULL,
    published_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT verification_outbox_status_check
        CHECK (status = ANY (ARRAY['pending', 'published', 'failed'])),
    CONSTRAINT verification_outbox_payload_object_check
        CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT verification_outbox_aggregate_event_key UNIQUE (aggregate_id, event_type)
);

CREATE INDEX verification_outbox_dispatch_idx
    ON public.verification_outbox (status, available_at);

ALTER TABLE public.asset_verification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_outbox ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN public.evidence.source_upload_id IS
    'Explicit provenance for uploaded evidence. Cascades derived evidence and links when the upload is deleted.';
COMMENT ON TABLE public.asset_verification_jobs IS
    'Durable asset-verification job history. Redis remains an optional polling cache.';
COMMENT ON TABLE public.verification_outbox IS
    'Transactional outbox for reliable publication of verification work.';
