-- Separates matcher certainty from the demonstrated depth used by scoring.

ALTER TABLE public.claim_evidence_links
    ADD COLUMN evidence_depth numeric(4,3);

UPDATE public.claim_evidence_links AS link
SET evidence_depth = LEAST(
        1::numeric,
        GREATEST(
            0::numeric,
            COALESCE(
                CASE
                    WHEN evidence.metadata ->> 'aiEvidenceDepth' ~ '^(0(\.[0-9]+)?|1(\.0+)?)$'
                        THEN (evidence.metadata ->> 'aiEvidenceDepth')::numeric
                    WHEN evidence.metadata ->> 'aiConfidence' ~ '^(0(\.[0-9]+)?|1(\.0+)?)$'
                        THEN (evidence.metadata ->> 'aiConfidence')::numeric
                    ELSE NULL
                END,
                link.link_confidence
            )
        )
    )
FROM public.evidence AS evidence
WHERE link.evidence_id = evidence.id
  AND evidence.provider = 'manual_upload';

ALTER TABLE public.claim_evidence_links
    ADD CONSTRAINT claim_evidence_links_evidence_depth_range_check
        CHECK (evidence_depth IS NULL OR (evidence_depth >= 0 AND evidence_depth <= 1));

COMMENT ON COLUMN public.claim_evidence_links.evidence_depth IS
    'Demonstrated skill depth in [0,1]. Link confidence remains matcher certainty.';
