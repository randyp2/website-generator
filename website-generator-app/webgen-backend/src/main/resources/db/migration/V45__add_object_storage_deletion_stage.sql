-- Adds the next durable account deletion stage without modifying the
-- previously released V44 migration.

ALTER TABLE public.account_deletion_requests
    ADD COLUMN object_storage_deleted_at timestamp with time zone;

ALTER TABLE public.account_deletion_requests
    DROP CONSTRAINT account_deletion_requests_stage_check;

ALTER TABLE public.account_deletion_requests
    ADD CONSTRAINT account_deletion_requests_stage_check
        CHECK (stage = ANY (ARRAY[
            'REQUESTED'::text,
            'STRIPE_CUSTOMER_DELETED'::text,
            'OBJECT_STORAGE_DELETED'::text
        ]));

COMMENT ON COLUMN public.account_deletion_requests.object_storage_deleted_at IS
    'Timestamp when both R2 and Supabase Storage cleanup completed successfully.';
