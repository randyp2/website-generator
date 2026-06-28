-- Tracks async email delivery state for in-app notifications.
-- This table is an internal delivery ledger, not a second notification source.

CREATE TABLE public.notification_email_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid NOT NULL,
    recipient_profile_id uuid NOT NULL,
    provider text DEFAULT 'resend'::text NOT NULL,
    provider_message_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    next_attempt_at timestamp with time zone DEFAULT now() NOT NULL,
    last_attempt_at timestamp with time zone,
    sent_at timestamp with time zone,
    failed_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_email_deliveries_status_check
        CHECK (
            status = ANY (
                ARRAY[
                    'pending'::text,
                    'processing'::text,
                    'sent'::text,
                    'failed'::text,
                    'skipped'::text
                ]
            )
        ),
    CONSTRAINT notification_email_deliveries_provider_not_blank_check
        CHECK (btrim(provider) <> ''::text),
    CONSTRAINT notification_email_deliveries_provider_message_not_blank_check
        CHECK (provider_message_id IS NULL OR btrim(provider_message_id) <> ''::text),
    CONSTRAINT notification_email_deliveries_attempt_count_check
        CHECK (attempt_count >= 0),
    CONSTRAINT notification_email_deliveries_sent_shape_check
        CHECK (status <> 'sent'::text OR sent_at IS NOT NULL)
);

ALTER TABLE ONLY public.notification_email_deliveries
    ADD CONSTRAINT notification_email_deliveries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notification_email_deliveries
    ADD CONSTRAINT notification_email_deliveries_notification_provider_key
        UNIQUE (notification_id, provider);

ALTER TABLE ONLY public.notification_email_deliveries
    ADD CONSTRAINT notification_email_deliveries_notification_id_fkey
        FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notification_email_deliveries
    ADD CONSTRAINT notification_email_deliveries_recipient_profile_id_fkey
        FOREIGN KEY (recipient_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX notification_email_deliveries_provider_message_id_key
    ON public.notification_email_deliveries USING btree (provider, provider_message_id)
    WHERE provider_message_id IS NOT NULL;

CREATE INDEX notification_email_deliveries_due_idx
    ON public.notification_email_deliveries USING btree (next_attempt_at, created_at)
    WHERE status = 'pending'::text;

CREATE INDEX notification_email_deliveries_recipient_created_at_idx
    ON public.notification_email_deliveries USING btree (recipient_profile_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_notification_email_delivery_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_email_deliveries_touch_updated_at
    BEFORE UPDATE ON public.notification_email_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_notification_email_delivery_updated_at();

COMMENT ON TABLE public.notification_email_deliveries IS
    'Internal ledger of email delivery attempts for in-app notifications.';
COMMENT ON COLUMN public.notification_email_deliveries.provider IS
    'Email delivery provider key, for example resend.';
COMMENT ON COLUMN public.notification_email_deliveries.status IS
    'Email delivery lifecycle state: pending, processing, sent, failed, skipped.';
COMMENT ON COLUMN public.notification_email_deliveries.next_attempt_at IS
    'Earliest timestamp when a pending delivery should be attempted.';
COMMENT ON COLUMN public.notification_email_deliveries.provider_message_id IS
    'Provider-assigned message identifier captured after a successful send.';
