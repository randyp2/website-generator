package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.summary.VerificationSummaryDTO;

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
