package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.ClaimDTO;

import java.util.List;
import java.util.UUID;

public interface ClaimIngestionService {

    /**
     * Ingest the raw skill strings from the parsed resume
     *  - Upsert into claims table
     *  - Find matching canonical skill
     * @param profileId                 - UUID of the user
     * @param resumeVerificationId      - UUID of the resume upload that produced these skills
     * @param rawSkills                 - raw skill strings returned by parser
     * @return the number of skill claims upserted
     */
    int ingestSkillClaims(UUID profileId, UUID resumeVerificationId, List<String> rawSkills);

    /** Get all skill claims for a user. */
    List<ClaimDTO> getSkillClaims(UUID profileId);

    /** Add a single manual skill claim, resolving to canonical if possible. */
    ClaimDTO addSkillClaim(UUID profileId, UUID resumeVerificationId, String skill);

    /** Delete a single claim owned by this user. */
    void deleteSkillClaim(UUID profileId, UUID claimId);
}
