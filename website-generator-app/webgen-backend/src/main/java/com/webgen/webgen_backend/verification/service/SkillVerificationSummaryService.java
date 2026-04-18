package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;

import java.util.UUID;

public interface SkillVerificationSummaryService {

    /**
     * Builds deterministic verification summary for skill claims only.
     *
     * @param profileId authenticated profile id
     * @return deterministic summary payload
     */
    VerificationSummaryDTO getSkillVerificationSummary(UUID profileId);
}
