ALTER TABLE public.site_ownership_verifications
    ADD COLUMN preview_url text,
    ADD COLUMN preview_status text DEFAULT 'NOT_REQUESTED'::text NOT NULL,
    ADD COLUMN preview_captured_at timestamp with time zone;

ALTER TABLE public.site_ownership_verifications
    ADD CONSTRAINT site_ownership_verifications_preview_status_check
        CHECK (preview_status = ANY (ARRAY[
            'NOT_REQUESTED'::text,
            'QUEUED'::text,
            'CAPTURING'::text,
            'READY'::text,
            'FAILED'::text
        ])),
    ADD CONSTRAINT site_ownership_verifications_preview_url_check
        CHECK (
            preview_url IS NULL
            OR (btrim(preview_url) <> ''::text AND char_length(preview_url) <= 2048)
        ),
    ADD CONSTRAINT site_ownership_verifications_ready_preview_check
        CHECK (
            preview_status <> 'READY'::text
            OR (preview_url IS NOT NULL AND preview_captured_at IS NOT NULL)
        );

COMMENT ON COLUMN public.site_ownership_verifications.preview_url IS
    'Versionless screenshot captured from the verified external website before publication.';
COMMENT ON COLUMN public.site_ownership_verifications.preview_status IS
    'Current state of the asynchronous external website preview capture.';
COMMENT ON COLUMN public.site_ownership_verifications.preview_captured_at IS
    'Time the external website preview currently stored in preview_url was captured.';
