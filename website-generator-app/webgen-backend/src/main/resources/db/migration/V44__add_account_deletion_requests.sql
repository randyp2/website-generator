-- Persists account deletion progress independently from profile data.
-- The row intentionally has no profile foreign key because it must survive
-- the later profile cascade and prevent profile recreation by an unexpired JWT.

CREATE TABLE public.account_deletion_requests (
    profile_id uuid NOT NULL,
    stage text DEFAULT 'REQUESTED'::text NOT NULL,
    stripe_customer_deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT account_deletion_requests_pkey PRIMARY KEY (profile_id),
    CONSTRAINT account_deletion_requests_stage_check
        CHECK (stage = ANY (ARRAY[
            'REQUESTED'::text,
            'STRIPE_CUSTOMER_DELETED'::text
        ]))
);

CREATE INDEX account_deletion_requests_stage_updated_at_idx
    ON public.account_deletion_requests USING btree (stage, updated_at);

COMMENT ON TABLE public.account_deletion_requests IS
    'Durable account deletion progress and tombstones keyed by authenticated user id.';
COMMENT ON COLUMN public.account_deletion_requests.profile_id IS
    'Supabase Auth user id. Deliberately not a foreign key to public.profiles.';
