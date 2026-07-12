-- Persists the identity used to collapse correlated evidence before scoring.

ALTER TABLE public.evidence
    ADD COLUMN evidence_group_key text;

-- Historical rows do not have verified object fingerprints or GitHub lineage
-- metadata. Preserve their behavior with the existing provider identity.
UPDATE public.evidence
SET evidence_group_key = provider || ':' || external_id;

ALTER TABLE public.evidence
    ALTER COLUMN evidence_group_key SET NOT NULL;

ALTER TABLE public.evidence
    ADD CONSTRAINT evidence_group_key_not_blank_check
        CHECK (length(btrim(evidence_group_key)) > 0);

CREATE INDEX evidence_profile_group_key_idx
    ON public.evidence (profile_id, evidence_group_key);

COMMENT ON COLUMN public.evidence.evidence_group_key IS
    'Stable source identity used to count correlated evidence only once per claim.';
