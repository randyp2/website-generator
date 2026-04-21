package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceSummaryDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ClaimEvidenceReadService {

    /**
     * Loads evidence summaries for a batch of claim ids owned by one profile.
     *
     * @param profileId profile owner of claims/evidence
     * @param claimIds  claim ids to enrich
     * @return map keyed by claim id
     */
    Map<UUID, ClaimEvidenceSummaryDTO> getEvidenceSummariesByClaimIds(
            UUID profileId,
            List<UUID> claimIds
    );
}
