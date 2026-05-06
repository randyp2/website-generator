-- Persists Stripe's scheduled cancellation timestamp for subscriptions that are set to cancel on a specific date.

ALTER TABLE public.billing_subscriptions
    ADD COLUMN IF NOT EXISTS cancel_at timestamp with time zone;

COMMENT ON COLUMN public.billing_subscriptions.cancel_at IS
    'Scheduled cancellation timestamp from Stripe subscription.cancel_at when present.';
