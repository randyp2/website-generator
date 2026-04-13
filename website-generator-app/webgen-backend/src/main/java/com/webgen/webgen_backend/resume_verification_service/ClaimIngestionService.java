package com.webgen.webgen_backend.resume_verification_service;

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
}
