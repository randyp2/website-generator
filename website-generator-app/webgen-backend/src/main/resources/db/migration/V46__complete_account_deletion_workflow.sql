-- Completes the durable account deletion workflow and ensures deleting a
-- profile removes every account-owned application row.

ALTER TABLE public.account_deletion_requests
    ADD COLUMN application_data_deleted_at timestamp with time zone,
    ADD COLUMN auth_user_deleted_at timestamp with time zone;

ALTER TABLE public.account_deletion_requests
    DROP CONSTRAINT account_deletion_requests_stage_check;

ALTER TABLE public.account_deletion_requests
    ADD CONSTRAINT account_deletion_requests_stage_check
        CHECK (stage = ANY (ARRAY[
            'REQUESTED'::text,
            'STRIPE_CUSTOMER_DELETED'::text,
            'OBJECT_STORAGE_DELETED'::text,
            'APPLICATION_DATA_DELETED'::text,
            'COMPLETED'::text
        ]));

-- Portfolios were historically related to profiles only by convention, so
-- legacy databases can contain rows whose profile has already gone missing.
-- Preserve those rows while enforcing ownership for new writes. Account
-- deletion also deletes by user_id explicitly so legacy rows remain removable.
ALTER TABLE public.portfolios
    ADD CONSTRAINT portfolios_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE
        NOT VALID;

-- A section-version author can be removed independently of the portfolio.
ALTER TABLE public.portfolio_section_versions
    DROP CONSTRAINT portfolio_section_versions_created_by_fkey;

ALTER TABLE public.portfolio_section_versions
    ADD CONSTRAINT portfolio_section_versions_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Verification outbox events are owned by their durable verification job.
-- Remove legacy orphan events that cannot be processed without that job.
DELETE FROM public.verification_outbox AS outbox
WHERE NOT EXISTS (
    SELECT 1
    FROM public.asset_verification_jobs AS job
    WHERE job.id = outbox.aggregate_id
);

ALTER TABLE public.verification_outbox
    ADD CONSTRAINT verification_outbox_aggregate_id_fkey
        FOREIGN KEY (aggregate_id)
        REFERENCES public.asset_verification_jobs(id)
        ON DELETE CASCADE;

-- Workers cancel queued jobs once account deletion begins.
ALTER TABLE public.asset_verification_jobs
    DROP CONSTRAINT asset_verification_jobs_status_check;

ALTER TABLE public.asset_verification_jobs
    ADD CONSTRAINT asset_verification_jobs_status_check
        CHECK (status = ANY (ARRAY[
            'queued'::text,
            'processing'::text,
            'completed'::text,
            'failed'::text,
            'canceled'::text
        ]));

COMMENT ON COLUMN public.account_deletion_requests.application_data_deleted_at IS
    'Timestamp when the profile and its account-owned application rows were deleted.';
COMMENT ON COLUMN public.account_deletion_requests.auth_user_deleted_at IS
    'Timestamp when permanent Supabase Auth deletion completed or was already complete.';
