-- Phase 1B introduces claims as the source of truth for verification.
-- Claims are extracted from resumes (and later user-edited), normalized to
-- canonical skills, and then used by scoring + evidence attachment workflows.

-- The claims table stores each verifiable statement about a user.
-- It links back to the user profile, optionally to the resume upload that
-- produced it, and optionally to a canonical skill after normalization.
CREATE TABLE public.claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    resume_verification_id uuid,
    claim_type text NOT NULL,
    raw_value text NOT NULL,
    canonical_skill_id uuid,
    source text DEFAULT 'resume'::text NOT NULL,
    confidence numeric(4,3),
    status text DEFAULT 'pending'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT claims_pkey PRIMARY KEY (id),
    CONSTRAINT claims_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT claims_resume_verification_id_fkey
        FOREIGN KEY (resume_verification_id) REFERENCES public.resume_verifications(id) ON DELETE CASCADE,
    CONSTRAINT claims_canonical_skill_id_fkey
        FOREIGN KEY (canonical_skill_id) REFERENCES public.skills(id) ON DELETE SET NULL,
    CONSTRAINT claims_claim_type_check
        CHECK (claim_type = ANY (ARRAY[
            'skill'::text,
            'experience'::text,
            'education'::text,
            'project'::text,
            'certification'::text,
            'achievement'::text,
            'other'::text
        ])),
    CONSTRAINT claims_source_check
        CHECK (source = ANY (ARRAY[
            'resume'::text,
            'manual'::text,
            'imported'::text
        ])),
    CONSTRAINT claims_status_check
        CHECK (status = ANY (ARRAY[
            'pending'::text,
            'user_confirmed'::text,
            'rejected'::text,
            'needs_evidence'::text,
            'verified'::text
        ])),
    CONSTRAINT claims_raw_value_not_blank
        CHECK (btrim(raw_value) <> ''::text),
    CONSTRAINT claims_confidence_range_check
        CHECK (confidence IS NULL OR (confidence >= 0::numeric AND confidence <= 1::numeric)),
    CONSTRAINT claims_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text),
    CONSTRAINT claims_resume_source_requires_resume_verification
        CHECK (source <> 'resume'::text OR resume_verification_id IS NOT NULL)
);

CREATE INDEX claims_profile_id_idx
    ON public.claims USING btree (profile_id);

CREATE INDEX claims_resume_verification_id_idx
    ON public.claims USING btree (resume_verification_id);

CREATE INDEX claims_canonical_skill_id_idx
    ON public.claims USING btree (canonical_skill_id);

CREATE INDEX claims_profile_status_idx
    ON public.claims USING btree (profile_id, status);

CREATE INDEX claims_profile_type_idx
    ON public.claims USING btree (profile_id, claim_type);

CREATE INDEX claims_profile_raw_value_lower_idx
    ON public.claims USING btree (profile_id, lower(raw_value));

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own claims"
    ON public.claims
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own claims"
    ON public.claims
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own claims"
    ON public.claims
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own claims"
    ON public.claims
    FOR DELETE
    USING (auth.uid() = profile_id);

COMMENT ON TABLE public.claims IS
    'Source-of-truth verification statements extracted from resumes or added by users.';
COMMENT ON COLUMN public.claims.raw_value IS
    'Original phrase detected or entered by the user before normalization.';
COMMENT ON COLUMN public.claims.canonical_skill_id IS
    'Resolved canonical skill reference used for deterministic scoring and suggestions.';
COMMENT ON COLUMN public.claims.source IS
    'Where the claim came from: resume parser, manual user input, or imported provider.';
COMMENT ON COLUMN public.claims.status IS
    'Verification workflow state used by review UI and evidence pipeline.';
