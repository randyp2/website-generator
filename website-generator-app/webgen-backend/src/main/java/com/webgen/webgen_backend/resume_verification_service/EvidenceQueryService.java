package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.evidence.EvidenceListResponseDTO;

import java.util.UUID;

public interface EvidenceQueryService {

    /**
     * Returns evidence rows for a profile, optionally scoped to a provider.
     *
     * @param profileId authenticated profile id
     * @param provider  optional provider filter
     * @return evidence list response
     */
    EvidenceListResponseDTO getEvidence(UUID profileId, String provider);
}
