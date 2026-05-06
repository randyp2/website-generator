-- Adds normalized invoice history rows for in-app billing views.
-- Invoice rows are upserted from Stripe invoice webhook events.

CREATE TABLE public.billing_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    stripe_invoice_id text NOT NULL,
    stripe_customer_id text NOT NULL,
    stripe_subscription_id text,
    event_type text NOT NULL,
    status text,
    amount_paid bigint,
    amount_due bigint,
    currency text,
    billing_reason text,
    plan_key text,
    price_id text,
    hosted_invoice_url text,
    invoice_pdf_url text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_invoices_pkey PRIMARY KEY (id),
    CONSTRAINT billing_invoices_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT billing_invoices_stripe_invoice_id_key
        UNIQUE (stripe_invoice_id),
    CONSTRAINT billing_invoices_stripe_invoice_id_not_blank
        CHECK (btrim(stripe_invoice_id) <> ''::text),
    CONSTRAINT billing_invoices_stripe_customer_id_not_blank
        CHECK (btrim(stripe_customer_id) <> ''::text),
    CONSTRAINT billing_invoices_event_type_not_blank
        CHECK (btrim(event_type) <> ''::text),
    CONSTRAINT billing_invoices_currency_not_blank
        CHECK (currency IS NULL OR btrim(currency) <> ''::text),
    CONSTRAINT billing_invoices_status_not_blank
        CHECK (status IS NULL OR btrim(status) <> ''::text),
    CONSTRAINT billing_invoices_billing_reason_not_blank
        CHECK (billing_reason IS NULL OR btrim(billing_reason) <> ''::text),
    CONSTRAINT billing_invoices_plan_key_not_blank
        CHECK (plan_key IS NULL OR btrim(plan_key) <> ''::text),
    CONSTRAINT billing_invoices_price_id_not_blank
        CHECK (price_id IS NULL OR btrim(price_id) <> ''::text),
    CONSTRAINT billing_invoices_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text)
);

CREATE INDEX billing_invoices_profile_occurred_at_idx
    ON public.billing_invoices USING btree (profile_id, occurred_at DESC, updated_at DESC);

CREATE INDEX billing_invoices_stripe_customer_occurred_at_idx
    ON public.billing_invoices USING btree (stripe_customer_id, occurred_at DESC);

CREATE INDEX billing_invoices_subscription_idx
    ON public.billing_invoices USING btree (stripe_subscription_id);

COMMENT ON TABLE public.billing_invoices IS
    'Normalized invoice snapshots from Stripe webhooks for in-app billing history.';
COMMENT ON COLUMN public.billing_invoices.event_type IS
    'Most recent Stripe webhook event type applied to the invoice row.';
COMMENT ON COLUMN public.billing_invoices.status IS
    'Invoice status from Stripe (for example paid, open, void, uncollectible).';
COMMENT ON COLUMN public.billing_invoices.amount_paid IS
    'Amount paid in the invoice currency minor unit.';
COMMENT ON COLUMN public.billing_invoices.amount_due IS
    'Amount due in the invoice currency minor unit.';
COMMENT ON COLUMN public.billing_invoices.occurred_at IS
    'Stripe event created timestamp used for timeline ordering.';
