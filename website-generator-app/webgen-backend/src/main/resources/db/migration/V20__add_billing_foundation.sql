-- Billing foundation for Stripe checkout + webhook processing.
-- Adds:
--   1) Stripe customer mapping on profiles
--   2) append-only credit ledger table
--   3) webhook event idempotency/audit table

-- ---------------------------------------------------------------------
-- profiles: Stripe customer mapping
-- ---------------------------------------------------------------------

ALTER TABLE public.profiles
    ADD COLUMN stripe_customer_id text;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_stripe_customer_id_not_blank
        CHECK (stripe_customer_id IS NULL OR btrim(stripe_customer_id) <> ''::text);

CREATE UNIQUE INDEX profiles_stripe_customer_id_key
    ON public.profiles USING btree (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS
    'Stripe customer identifier for subscription and checkout lifecycle tracking.';

-- ---------------------------------------------------------------------
-- billing_credit_ledger_entries: source-of-truth credit movements
-- ---------------------------------------------------------------------

CREATE TABLE public.billing_credit_ledger_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    delta_credits integer NOT NULL,
    reason text NOT NULL,
    stripe_event_id text,
    checkout_session_id text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_credit_ledger_entries_pkey PRIMARY KEY (id),
    CONSTRAINT billing_credit_ledger_entries_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT billing_credit_ledger_entries_delta_nonzero
        CHECK (delta_credits <> 0),
    CONSTRAINT billing_credit_ledger_entries_reason_not_blank
        CHECK (btrim(reason) <> ''::text),
    CONSTRAINT billing_credit_ledger_entries_stripe_event_id_not_blank
        CHECK (stripe_event_id IS NULL OR btrim(stripe_event_id) <> ''::text),
    CONSTRAINT billing_credit_ledger_entries_checkout_session_id_not_blank
        CHECK (checkout_session_id IS NULL OR btrim(checkout_session_id) <> ''::text),
    CONSTRAINT billing_credit_ledger_entries_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text)
);

CREATE INDEX billing_credit_ledger_entries_profile_created_at_idx
    ON public.billing_credit_ledger_entries USING btree (profile_id, created_at DESC);

CREATE INDEX billing_credit_ledger_entries_stripe_event_id_idx
    ON public.billing_credit_ledger_entries USING btree (stripe_event_id);

CREATE INDEX billing_credit_ledger_entries_checkout_session_id_idx
    ON public.billing_credit_ledger_entries USING btree (checkout_session_id);

COMMENT ON TABLE public.billing_credit_ledger_entries IS
    'Append-only credit ledger used to derive current user credit balances.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.delta_credits IS
    'Positive for grants/top-ups, negative for usage deductions.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.reason IS
    'Reason code for the credit movement (for example plan_grant, credit_pack_purchase, generation_usage).';
COMMENT ON COLUMN public.billing_credit_ledger_entries.metadata IS
    'Structured audit payload for billing reconciliation/debug.';

-- ---------------------------------------------------------------------
-- stripe_webhook_events: webhook idempotency + audit log
-- ---------------------------------------------------------------------

CREATE TABLE public.stripe_webhook_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_event_id text NOT NULL,
    event_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    processed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stripe_webhook_events_pkey PRIMARY KEY (id),
    CONSTRAINT stripe_webhook_events_stripe_event_id_key UNIQUE (stripe_event_id),
    CONSTRAINT stripe_webhook_events_stripe_event_id_not_blank
        CHECK (btrim(stripe_event_id) <> ''::text),
    CONSTRAINT stripe_webhook_events_event_type_not_blank
        CHECK (btrim(event_type) <> ''::text),
    CONSTRAINT stripe_webhook_events_payload_object_check
        CHECK (jsonb_typeof(payload) = 'object'::text)
);

CREATE INDEX stripe_webhook_events_event_type_idx
    ON public.stripe_webhook_events USING btree (event_type);

CREATE INDEX stripe_webhook_events_processed_at_idx
    ON public.stripe_webhook_events USING btree (processed_at DESC);

COMMENT ON TABLE public.stripe_webhook_events IS
    'Processed Stripe webhook events used for idempotency and post-mortem auditing.';
