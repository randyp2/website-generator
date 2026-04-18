package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Assembles skill-claim scoring inputs enriched with deterministic evidence
 * link signals.
 */
public interface ClaimEvidenceScoringInputAssemblerService {

    /**
     * Builds kernel-ready claim inputs by attaching normalized evidence-link
     * signals to each skill claim.
     *
     * @param profileId            owner profile id
     * @param skillClaims          raw skill claims for the profile
     * @param canonicalSkillsById  canonical skill metadata keyed by skill id
     * @param asOf                 scoring evaluation timestamp (optional)
     * @return enriched claim inputs in the same order as {@code skillClaims}
     */
    List<SkillClaimInput> assembleSkillClaimInputs(
            UUID profileId,
            List<Claim> skillClaims,
            Map<UUID, Skill> canonicalSkillsById,
            OffsetDateTime asOf
    );
}
