-- Extends the existing credit ledger with scoped, expiring allowance buckets.
-- Existing entries remain unrestricted general credits until explicitly migrated.

ALTER TABLE public.billing_credit_ledger_entries
    ADD COLUMN credit_bucket text DEFAULT 'general'::text NOT NULL,
    ADD COLUMN valid_from timestamp with time zone,
    ADD COLUMN expires_at timestamp with time zone,
    ADD COLUMN grant_entry_id uuid,
    ADD COLUMN grant_key text;

ALTER TABLE public.billing_credit_ledger_entries
    ADD CONSTRAINT billing_credit_ledger_entries_credit_bucket_check
        CHECK (credit_bucket IN (
            'general'::text,
            'portfolio_generation'::text,
            'portfolio_refinement'::text,
            'asset_verification'::text
        )),
    ADD CONSTRAINT billing_credit_ledger_entries_allowance_window_check
        CHECK (
            expires_at IS NULL
            OR (valid_from IS NOT NULL AND expires_at > valid_from)
        ),
    ADD CONSTRAINT billing_credit_ledger_entries_grant_entry_not_self_check
        CHECK (grant_entry_id IS NULL OR grant_entry_id <> id),
    ADD CONSTRAINT billing_credit_ledger_entries_grant_key_not_blank_check
        CHECK (grant_key IS NULL OR btrim(grant_key) <> ''::text),
    ADD CONSTRAINT billing_credit_ledger_entries_grant_entry_id_fkey
        FOREIGN KEY (grant_entry_id)
        REFERENCES public.billing_credit_ledger_entries(id)
        ON DELETE SET NULL;

CREATE UNIQUE INDEX billing_credit_ledger_entries_grant_key_key
    ON public.billing_credit_ledger_entries USING btree (grant_key)
    WHERE grant_key IS NOT NULL;

CREATE INDEX billing_credit_ledger_entries_profile_bucket_window_idx
    ON public.billing_credit_ledger_entries USING btree (
        profile_id,
        credit_bucket,
        valid_from,
        expires_at
    );

CREATE INDEX billing_credit_ledger_entries_grant_entry_id_idx
    ON public.billing_credit_ledger_entries USING btree (grant_entry_id)
    WHERE grant_entry_id IS NOT NULL;

COMMENT ON COLUMN public.billing_credit_ledger_entries.credit_bucket IS
    'Balance bucket for unrestricted credits or feature-specific allowance units.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.valid_from IS
    'Inclusive start of an allowance grant validity window; null for unrestricted credits.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.expires_at IS
    'Exclusive end of an allowance grant validity window; null for non-expiring grants and credits.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.grant_entry_id IS
    'Original positive allowance grant consumed or restored by this ledger entry.';
COMMENT ON COLUMN public.billing_credit_ledger_entries.grant_key IS
    'Stable idempotency key preventing duplicate free, subscription, or promotional grants.';

-- Stores launch campaign email eligibility before and after an account claims it.
CREATE TABLE public.billing_promotion_eligibilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_key text NOT NULL,
    normalized_email text NOT NULL,
    claimed_profile_id uuid,
    claimed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT billing_promotion_eligibilities_pkey PRIMARY KEY (id),
    CONSTRAINT billing_promotion_eligibilities_campaign_email_key
        UNIQUE (campaign_key, normalized_email),
    CONSTRAINT billing_promotion_eligibilities_claimed_profile_id_fkey
        FOREIGN KEY (claimed_profile_id)
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,
    CONSTRAINT billing_promotion_eligibilities_campaign_key_check
        CHECK (campaign_key ~ '^[a-z0-9][a-z0-9_-]*$'::text),
    CONSTRAINT billing_promotion_eligibilities_email_check
        CHECK (
            char_length(normalized_email) BETWEEN 3 AND 320
            AND normalized_email = lower(btrim(normalized_email))
            AND position('@'::text IN normalized_email) > 1
        ),
    CONSTRAINT billing_promotion_eligibilities_claim_shape_check
        CHECK (claimed_profile_id IS NULL OR claimed_at IS NOT NULL),
    CONSTRAINT billing_promotion_eligibilities_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text)
);

CREATE UNIQUE INDEX billing_promotion_eligibilities_campaign_profile_key
    ON public.billing_promotion_eligibilities USING btree (
        campaign_key,
        claimed_profile_id
    )
    WHERE claimed_profile_id IS NOT NULL;

CREATE INDEX billing_promotion_eligibilities_unclaimed_email_idx
    ON public.billing_promotion_eligibilities USING btree (
        normalized_email,
        campaign_key
    )
    WHERE claimed_at IS NULL;

COMMENT ON TABLE public.billing_promotion_eligibilities IS
    'Durable email allowlist and claim history for one-time billing promotion campaigns.';
COMMENT ON COLUMN public.billing_promotion_eligibilities.campaign_key IS
    'Stable campaign identifier, for example launch_access_2026.';
COMMENT ON COLUMN public.billing_promotion_eligibilities.normalized_email IS
    'Trimmed lowercase email eligible to claim the campaign once.';
COMMENT ON COLUMN public.billing_promotion_eligibilities.claimed_profile_id IS
    'Profile that claimed the promotion; cleared on profile deletion while claim history remains.';
COMMENT ON COLUMN public.billing_promotion_eligibilities.claimed_at IS
    'Time the promotion was claimed; retained after profile deletion to prevent reuse.';
COMMENT ON COLUMN public.billing_promotion_eligibilities.metadata IS
    'Structured campaign administration and audit context.';
