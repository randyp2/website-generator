-- Persist one-time ownership challenges for externally hosted portfolios.
-- Verification is completed by the backend before an external portfolio is published.

CREATE TABLE public.site_ownership_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    verification_url text NOT NULL,
    canonical_origin text NOT NULL,
    method text DEFAULT 'HTML_META'::text NOT NULL,
    challenge_token text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    challenge_expires_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_ownership_verifications_pkey PRIMARY KEY (id),
    CONSTRAINT site_ownership_verifications_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT site_ownership_verifications_user_url_method_key
        UNIQUE (user_id, verification_url, method),
    CONSTRAINT site_ownership_verifications_challenge_token_key
        UNIQUE (challenge_token),
    CONSTRAINT site_ownership_verifications_url_not_blank
        CHECK (btrim(verification_url) <> ''::text),
    CONSTRAINT site_ownership_verifications_url_length
        CHECK (char_length(verification_url) <= 2048),
    CONSTRAINT site_ownership_verifications_origin_not_blank
        CHECK (btrim(canonical_origin) <> ''::text),
    CONSTRAINT site_ownership_verifications_origin_length
        CHECK (char_length(canonical_origin) <= 512),
    CONSTRAINT site_ownership_verifications_method_check
        CHECK (method = 'HTML_META'::text),
    CONSTRAINT site_ownership_verifications_token_length
        CHECK (char_length(challenge_token) BETWEEN 32 AND 128),
    CONSTRAINT site_ownership_verifications_status_check
        CHECK (status = ANY (ARRAY[
            'PENDING'::text,
            'VERIFIED'::text,
            'EXPIRED'::text
        ])),
    CONSTRAINT site_ownership_verifications_expiry_after_creation
        CHECK (challenge_expires_at > created_at),
    CONSTRAINT site_ownership_verifications_verified_at_check
        CHECK ((status = 'VERIFIED'::text) = (verified_at IS NOT NULL))
);

CREATE INDEX site_ownership_verifications_user_status_idx
    ON public.site_ownership_verifications USING btree (user_id, status);

CREATE INDEX site_ownership_verifications_pending_expiry_idx
    ON public.site_ownership_verifications USING btree (challenge_expires_at)
    WHERE status = 'PENDING'::text;

ALTER TABLE public.site_ownership_verifications ENABLE ROW LEVEL SECURITY;

-- Clients may inspect their own challenge, but only the backend may create or
-- transition verification records. This prevents clients from self-verifying.
CREATE POLICY site_ownership_verifications_select_own
    ON public.site_ownership_verifications
    FOR SELECT
    USING (user_id = auth.uid());

ALTER TABLE public.portfolios
    ADD COLUMN site_verification_id uuid;

ALTER TABLE public.portfolios
    ADD CONSTRAINT portfolios_site_verification_id_fkey
        FOREIGN KEY (site_verification_id)
        REFERENCES public.site_ownership_verifications(id)
        ON DELETE SET NULL;

CREATE INDEX portfolios_site_verification_id_idx
    ON public.portfolios USING btree (site_verification_id)
    WHERE site_verification_id IS NOT NULL;

COMMENT ON TABLE public.site_ownership_verifications IS
    'One-time proof that a user controlled an external website before publishing it.';
COMMENT ON COLUMN public.site_ownership_verifications.verification_url IS
    'Canonical public URL whose HTML must contain the ownership challenge.';
COMMENT ON COLUMN public.site_ownership_verifications.canonical_origin IS
    'Normalized scheme, host, and port to which the verification is bound.';
COMMENT ON COLUMN public.site_ownership_verifications.challenge_token IS
    'Public random value placed in the website meta tag. It is not an authentication secret.';
COMMENT ON COLUMN public.portfolios.site_verification_id IS
    'Ownership verification that authorized an external portfolio publication.';
