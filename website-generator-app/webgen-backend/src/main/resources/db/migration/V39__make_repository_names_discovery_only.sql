-- Reconciles claims previously promoted by repository-name metadata alone.

UPDATE public.claims AS claim
SET status = 'needs_evidence',
    updated_at = now()
WHERE claim.claim_type = 'skill'
  AND claim.status = 'corroborated'
  AND claim.canonical_skill_id IS NOT NULL
  AND EXISTS (
      SELECT 1
      FROM public.claim_evidence_links AS discovery_link
      WHERE discovery_link.claim_id = claim.id
        AND discovery_link.profile_id = claim.profile_id
        AND lower(btrim(discovery_link.link_type)) IN ('name_match', 'description_match')
  )
  AND NOT EXISTS (
      SELECT 1
      FROM public.claim_evidence_links AS scoring_link
      WHERE scoring_link.claim_id = claim.id
        AND scoring_link.profile_id = claim.profile_id
        AND lower(btrim(scoring_link.link_type)) NOT IN ('name_match', 'description_match')
        AND scoring_link.link_confidence >= 0.50
  );

COMMENT ON COLUMN public.claim_evidence_links.link_type IS
    'Evidence relationship type. name_match and description_match are discovery provenance excluded from verification progress.';
