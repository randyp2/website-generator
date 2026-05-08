-- Remove async-only upload lifecycle statuses now that upload finalization is synchronous.
-- Allowed statuses become: uploaded, completed, failed.

ALTER TABLE public.claim_evidence_uploads
    DROP CONSTRAINT IF EXISTS claim_evidence_uploads_status_check;

UPDATE public.claim_evidence_uploads
SET status = 'completed'::text,
    updated_at = now()
WHERE status = ANY (ARRAY[
    'queued'::text,
    'analyzing'::text
]);

ALTER TABLE public.claim_evidence_uploads
    ADD CONSTRAINT claim_evidence_uploads_status_check
    CHECK (status = ANY (ARRAY[
        'uploaded'::text,
        'completed'::text,
        'failed'::text
    ]));

COMMENT ON COLUMN public.claim_evidence_uploads.status IS
    'Upload lifecycle status: uploaded, completed, failed.';
