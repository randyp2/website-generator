package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.entity.Claim;
import com.webgen.webgen_backend.entity.Profile;
import com.webgen.webgen_backend.entity.ResumeVerification;
import com.webgen.webgen_backend.entity.Skill;
import com.webgen.webgen_backend.repository.ClaimRepository;
import com.webgen.webgen_backend.repository.ProfileRepository;
import com.webgen.webgen_backend.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.repository.SkillRepository;
import com.webgen.webgen_backend.resume_verification_service.ClaimIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimIngestionServiceImpl implements ClaimIngestionService {


    private final ClaimRepository claimRepository;
    private final SkillRepository skillRepository;
    private final ResumeVerificationRepository resumeVerificationRepository;
    private final ProfileRepository profileRepository;

    private final ObjectMapper objectMapper;

    /** Make class transactional - all claims get upserted or no claims get upserted*/
    @Override
    @Transactional
    public int ingestSkillClaims(UUID profileId, UUID resumeVerificationId, List<String> rawSkills) {

        // --- Check for row instance existence
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found: " + profileId));

        ResumeVerification resumeVerification = resumeVerificationRepository.findById(resumeVerificationId)
                .orElseThrow(() -> new IllegalArgumentException("Resume to verify not found: " + resumeVerificationId));

        // --- Ingest the raw skills into the claims table
        int upserted = 0;
        for (String rawSkill: rawSkills) {
            String trimmed = rawSkill.trim();
            if (trimmed.isEmpty()) continue;

            // Resolve the skill
            UUID canonicalSkillId = resolveCanonicalSkillId(trimmed);

            // Check if the user already has a skill claim with raw_value
            Optional<Claim> existingClaim = claimRepository
                    .findSkillClaimByProfileAndRawValue(profileId, trimmed);

            OffsetDateTime now = OffsetDateTime.now();

            if (existingClaim.isPresent()) {
                // update the claim timestamp
                Claim claim = existingClaim.get();
                claim.setCanonicalSkillId(canonicalSkillId);
                claim.setResumeVerification(resumeVerification);
                claim.setUpdatedAt(now);
                claimRepository.save(claim);
            } else {
                // Ingest new claim
                Claim claim = Claim.builder()
                        .id(UUID.randomUUID())
                        .profile(profile)
                        .resumeVerification(resumeVerification)
                        .claimType("skill")
                        .rawValue(trimmed)
                        .canonicalSkillId(canonicalSkillId)
                        .source("resume")
                        .confidence(null)
                        .status("pending")
                        .metadata(objectMapper.createObjectNode())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

                claimRepository.save(claim);
            }
            upserted++;
        }

        return upserted;
    }


    /**
     * Resolves the raw skill into a canonical claim
     * i.e) JS -> Javascript
     *
     * Order to resolve:
     *  1) Exact match on skills.name (case-insensitive, no alias required)
     *  2) Match on skill_alliases.alias
     *  3) Null, resolved later (will create new row with LLM help)
     * @param rawSkill - String representing the raw extracted skill from the resume
     * @return the UUID of skill id
     */
    private UUID resolveCanonicalSkillId(String rawSkill) {

        // --- Exact match
        Optional<Skill> exactSkill = skillRepository.findByNameIgnoreCase(rawSkill);
        if (exactSkill.isPresent()) return exactSkill.get().getId();

        // --- Use skill alias table
        Optional<Skill> aliasSkill = skillRepository.findByAliasIgnoreCase(rawSkill);
        if (aliasSkill.isPresent()) return aliasSkill.get().getId();

        // --- No match found | TODO: resolve later
        return null;
    }
}
