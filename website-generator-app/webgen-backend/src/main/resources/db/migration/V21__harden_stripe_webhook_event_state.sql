-- Hardens webhook idempotency state handling for Stripe event processing.
-- Adds explicit processing lifecycle columns to stripe_webhook_events and
-- allows processed_at to be NULL while an event is in processing/failed state.

ALTER TABLE public.stripe_webhook_events
    ADD COLUMN status text,
    ADD COLUMN last_error text,
    ADD COLUMN processing_started_at timestamp with time zone;

UPDATE public.stripe_webhook_events
SET status = 'processed'
WHERE status IS NULL;

ALTER TABLE public.stripe_webhook_events
    ALTER COLUMN status SET DEFAULT 'processed',
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN processed_at DROP NOT NULL;

ALTER TABLE public.stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_status_check
        CHECK (status IN ('processing'::text, 'processed'::text, 'failed'::text));

CREATE INDEX stripe_webhook_events_status_idx
    ON public.stripe_webhook_events USING btree (status);

COMMENT ON COLUMN public.stripe_webhook_events.status IS
    'Webhook processing lifecycle state: processing, processed, failed.';
COMMENT ON COLUMN public.stripe_webhook_events.last_error IS
    'Last processing error message captured when status transitions to failed.';
COMMENT ON COLUMN public.stripe_webhook_events.processing_started_at IS
    'Timestamp for the current processing claim window.';
