-- Phase 6 functional sync/evidence foundation.
-- Adds:
--   1) provider-agnostic evidence storage with idempotent dedupe keys
--   2) claim <-> evidence links for deterministic matching
--   3) connected account sync lifecycle metadata for UI status surfaces

-- ---------------------------------------------------------------------
-- connected_accounts: sync lifecycle metadata
-- ---------------------------------------------------------------------

ALTER TABLE public.connected_accounts
    ADD COLUMN last_sync_status text DEFAULT 'never'::text NOT NULL,
    ADD COLUMN last_sync_error text,
    ADD COLUMN last_sync_started_at timestamp with time zone,
    ADD COLUMN last_sync_completed_at timestamp with time zone,
    ADD COLUMN last_sync_imported_count integer DEFAULT 0 NOT NULL,
    ADD COLUMN last_sync_linked_count integer DEFAULT 0 NOT NULL;

ALTER TABLE public.connected_accounts
    ADD CONSTRAINT connected_accounts_last_sync_status_check
        CHECK (last_sync_status = ANY (ARRAY[
            'never'::text,
            'running'::text,
            'success'::text,
            'failed'::text
        ])),
    ADD CONSTRAINT connected_accounts_last_sync_error_not_blank
        CHECK (last_sync_error IS NULL OR btrim(last_sync_error) <> ''::text),
    ADD CONSTRAINT connected_accounts_last_sync_imported_count_nonnegative
        CHECK (last_sync_imported_count >= 0),
    ADD CONSTRAINT connected_accounts_last_sync_linked_count_nonnegative
        CHECK (last_sync_linked_count >= 0);

CREATE INDEX connected_accounts_profile_last_sync_status_idx
    ON public.connected_accounts USING btree (profile_id, last_sync_status);

COMMENT ON COLUMN public.connected_accounts.last_sync_status IS
    'Lifecycle status for manual sync runs: never, running, success, or failed.';
COMMENT ON COLUMN public.connected_accounts.last_sync_error IS
    'Last provider sync error surfaced to UI when sync_status=failed.';
COMMENT ON COLUMN public.connected_accounts.last_sync_started_at IS
    'Timestamp when the most recent sync run started.';
COMMENT ON COLUMN public.connected_accounts.last_sync_completed_at IS
    'Timestamp when the most recent sync run completed (success or failed).';
COMMENT ON COLUMN public.connected_accounts.last_sync_imported_count IS
    'Evidence rows imported in the most recent completed sync.';
COMMENT ON COLUMN public.connected_accounts.last_sync_linked_count IS
    'Claim-evidence links created/updated in the most recent completed sync.';

-- ---------------------------------------------------------------------
-- evidence: normalized provider evidence rows
-- ---------------------------------------------------------------------

CREATE TABLE public.evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    provider text NOT NULL,
    external_id text NOT NULL,
    evidence_type text NOT NULL,
    title text,
    description text,
    source_url text,
    occurred_at timestamp with time zone,
    captured_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT evidence_pkey PRIMARY KEY (id),
    CONSTRAINT evidence_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT evidence_profile_provider_external_id_key UNIQUE (profile_id, provider, external_id),
    CONSTRAINT evidence_id_profile_key UNIQUE (id, profile_id),
    CONSTRAINT evidence_provider_not_blank
        CHECK (btrim(provider) <> ''::text),
    CONSTRAINT evidence_external_id_not_blank
        CHECK (btrim(external_id) <> ''::text),
    CONSTRAINT evidence_type_not_blank
        CHECK (btrim(evidence_type) <> ''::text),
    CONSTRAINT evidence_title_not_blank
        CHECK (title IS NULL OR btrim(title) <> ''::text),
    CONSTRAINT evidence_source_url_not_blank
        CHECK (source_url IS NULL OR btrim(source_url) <> ''::text),
    CONSTRAINT evidence_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text)
);

CREATE INDEX evidence_profile_id_idx
    ON public.evidence USING btree (profile_id);

CREATE INDEX evidence_profile_provider_idx
    ON public.evidence USING btree (profile_id, provider);

CREATE INDEX evidence_profile_captured_at_idx
    ON public.evidence USING btree (profile_id, captured_at DESC);

CREATE INDEX evidence_provider_type_idx
    ON public.evidence USING btree (provider, evidence_type);

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own evidence"
    ON public.evidence
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own evidence"
    ON public.evidence
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own evidence"
    ON public.evidence
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own evidence"
    ON public.evidence
    FOR DELETE
    USING (auth.uid() = profile_id);

COMMENT ON TABLE public.evidence IS
    'Normalized external provider evidence used for deterministic claim matching.';
COMMENT ON COLUMN public.evidence.external_id IS
    'Provider-stable idempotency key segment. Combined with profile_id and provider for dedupe.';
COMMENT ON COLUMN public.evidence.evidence_type IS
    'Normalized evidence category (for example repository, profile, commit).';
COMMENT ON COLUMN public.evidence.source_url IS
    'Source URL for display/drill-down to the provider record.';
COMMENT ON COLUMN public.evidence.metadata IS
    'Provider-specific normalized payload used by deterministic matching rules.';
COMMENT ON COLUMN public.evidence.captured_at IS
    'Timestamp when this evidence snapshot was ingested from provider APIs.';

-- ---------------------------------------------------------------------
-- claim_evidence_links: deterministic many-to-many links
-- ---------------------------------------------------------------------

ALTER TABLE public.claims
    ADD CONSTRAINT claims_id_profile_key UNIQUE (id, profile_id);

CREATE TABLE public.claim_evidence_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    claim_id uuid NOT NULL,
    evidence_id uuid NOT NULL,
    link_type text NOT NULL,
    link_confidence numeric(4,3) NOT NULL,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT claim_evidence_links_pkey PRIMARY KEY (id),
    CONSTRAINT claim_evidence_links_claim_evidence_key UNIQUE (claim_id, evidence_id),
    CONSTRAINT claim_evidence_links_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT claim_evidence_links_claim_profile_fkey
        FOREIGN KEY (claim_id, profile_id) REFERENCES public.claims(id, profile_id) ON DELETE CASCADE,
    CONSTRAINT claim_evidence_links_evidence_profile_fkey
        FOREIGN KEY (evidence_id, profile_id) REFERENCES public.evidence(id, profile_id) ON DELETE CASCADE,
    CONSTRAINT claim_evidence_links_link_type_not_blank
        CHECK (btrim(link_type) <> ''::text),
    CONSTRAINT claim_evidence_links_link_confidence_range_check
        CHECK (link_confidence >= 0::numeric AND link_confidence <= 1::numeric),
    CONSTRAINT claim_evidence_links_reason_not_blank
        CHECK (reason IS NULL OR btrim(reason) <> ''::text),
    CONSTRAINT claim_evidence_links_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text)
);

CREATE INDEX claim_evidence_links_profile_id_idx
    ON public.claim_evidence_links USING btree (profile_id);

CREATE INDEX claim_evidence_links_claim_id_idx
    ON public.claim_evidence_links USING btree (claim_id);

CREATE INDEX claim_evidence_links_evidence_id_idx
    ON public.claim_evidence_links USING btree (evidence_id);

CREATE INDEX claim_evidence_links_profile_claim_idx
    ON public.claim_evidence_links USING btree (profile_id, claim_id);

ALTER TABLE public.claim_evidence_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own claim evidence links"
    ON public.claim_evidence_links
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own claim evidence links"
    ON public.claim_evidence_links
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own claim evidence links"
    ON public.claim_evidence_links
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own claim evidence links"
    ON public.claim_evidence_links
    FOR DELETE
    USING (auth.uid() = profile_id);

COMMENT ON TABLE public.claim_evidence_links IS
    'Deterministic links between claims and evidence with confidence annotations.';
COMMENT ON COLUMN public.claim_evidence_links.link_type IS
    'Rule classifier for why link exists (for example exact_keyword, topic_match).';
COMMENT ON COLUMN public.claim_evidence_links.link_confidence IS
    'Confidence score in [0,1] produced by deterministic linking rules.';
COMMENT ON COLUMN public.claim_evidence_links.reason IS
    'Human-readable explanation for audit/debug UI.';
