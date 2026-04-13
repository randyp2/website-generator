package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.profile.verification.ClaimDTO;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

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

        // --- Validate inputs
        if (resumeVerificationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resumeVerificationId is required");
        }
        if (rawSkills == null || rawSkills.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "skills list cannot be empty");
        }

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        ResumeVerification resumeVerification = resumeVerificationRepository.findById(resumeVerificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume verification not found"));

        // Ownership check: resume verification must belong to this user
        if (!resumeVerification.getProfile().getId().equals(profileId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Resume verification does not belong to this user");
        }

        // --- Ingest the raw skills into the claims table
        System.out.println(">>> [CLAIM INGESTION] Starting ingestion of " + rawSkills.size() + " raw skills");

        int upserted = 0;
        int matched = 0;
        int unmatched = 0;

        for (String rawSkill: rawSkills) {
            String trimmed = rawSkill.trim();
            if (trimmed.isEmpty()) continue;

            // Pre-normalize: expand "Languages: React/Redux (Hooks)" into
            // individual candidates like ["React", "Redux", "Hooks"]
            List<String> candidates = normalizeAndSplit(trimmed);
            System.out.println(">>>   [NORMALIZE] \"" + trimmed + "\" -> " + candidates);

            for (String candidate : candidates) {

            // Resolve the skill
            UUID canonicalSkillId = resolveCanonicalSkillId(candidate);
            if (canonicalSkillId != null) {
                matched++;
            } else {
                unmatched++;
            }

            // Check if the user already has a skill claim with raw_value
            Optional<Claim> existingClaim = claimRepository
                    .findSkillClaimByProfileAndRawValue(profileId, candidate);

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
                        .rawValue(candidate)
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
        }

        System.out.println(">>> [CLAIM INGESTION] Complete: " + upserted + " claims upserted, "
                + matched + " matched to canonical skills, " + unmatched + " unmatched");

        return upserted;
    }


    // ── CRUD operations ────────────────────────────────────────────────

    @Override
    public List<ClaimDTO> getSkillClaims(UUID profileId) {
        return claimRepository.findByProfileId(profileId).stream()
                .filter(c -> "skill".equals(c.getClaimType()))
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public ClaimDTO addSkillClaim(UUID profileId, UUID resumeVerificationId, String skill) {
        String trimmed = skill.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill cannot be blank");
        }

        // Check for duplicate
        Optional<Claim> existing = claimRepository.findSkillClaimByProfileAndRawValue(profileId, trimmed);
        if (existing.isPresent()) {
            return toDto(existing.get());
        }

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        ResumeVerification resumeVerification = resumeVerificationRepository.findById(resumeVerificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume verification not found"));

        // Ownership check: resume verification must belong to this user
        if (!resumeVerification.getProfile().getId().equals(profileId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Resume verification does not belong to this user");
        }

        UUID canonicalSkillId = resolveCanonicalSkillId(trimmed);
        OffsetDateTime now = OffsetDateTime.now();

        Claim claim = Claim.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .resumeVerification(resumeVerification)
                .claimType("skill")
                .rawValue(trimmed)
                .canonicalSkillId(canonicalSkillId)
                .source("manual")
                .confidence(null)
                .status("pending")
                .metadata(objectMapper.createObjectNode())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toDto(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public void deleteSkillClaim(UUID profileId, UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));

        if (!claim.getProfile().getId().equals(profileId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your claim");
        }

        claimRepository.delete(claim);
    }

    // ── DTO mapping ──────────────────────────────────────────────────

    private ClaimDTO toDto(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(claim.getId());
        dto.setProfileId(claim.getProfile().getId());
        dto.setResumeVerificationId(
                claim.getResumeVerification() != null ? claim.getResumeVerification().getId() : null
        );
        dto.setClaimType(claim.getClaimType());
        dto.setRawValue(claim.getRawValue());
        dto.setCanonicalSkillId(claim.getCanonicalSkillId());
        dto.setSource(claim.getSource());
        dto.setConfidence(claim.getConfidence());
        dto.setStatus(claim.getStatus());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());

        // Resolve canonical skill name for display
        if (claim.getCanonicalSkillId() != null) {
            skillRepository.findById(claim.getCanonicalSkillId())
                    .ifPresent(skill -> dto.setCanonicalSkillName(skill.getName()));
        }

        return dto;
    }

    // ── Pre-normalization ──────────────────────────────────────────────

    /** Label prefixes like "Languages:", "Frameworks:", "Tools:" etc. */
    private static final Pattern LABEL_PREFIX = Pattern.compile("^[A-Za-z &/]+:\\s*");

    /** Trailing punctuation that isn't part of a skill name. */
    private static final Pattern TRAILING_PUNCT = Pattern.compile("[.,;:!?]+$");

    /**
     * Known compound terms that should NOT be split on "/".
     * Checked case-insensitively.
     */
    private static final List<String> SLASH_COMPOUNDS = List.of(
            "CI/CD", "SSL/TLS", "TCP/IP", "HTML/CSS", "FP&A",
            "OS/2", "I/O", "R&D", "S/4HANA", "A/R", "A/P", "G/L"
    );

    /**
     * Pre-normalizes a raw skill string into one or more clean candidates.
     *
     * Steps:
     *   1. Strip label prefix  ("Languages: React" -> "React")
     *   2. Strip trailing punctuation ("Python." -> "Python")
     *   3. Extract parenthetical items as separate candidates
     *      ("Node.js (Express)" -> ["Node.js", "Express"])
     *   4. Split on "/" unless it's a known compound
     *      ("React/Redux" -> ["React", "Redux"])
     *      ("CI/CD" -> ["CI/CD"])
     */
    private List<String> normalizeAndSplit(String raw) {
        List<String> results = new ArrayList<>();

        // 1. Strip label prefix
        String cleaned = LABEL_PREFIX.matcher(raw).replaceFirst("");

        // 2. Strip trailing punctuation
        cleaned = TRAILING_PUNCT.matcher(cleaned).replaceFirst("");
        cleaned = cleaned.trim();
        if (cleaned.isEmpty()) return results;

        // 3. Extract parenthetical content as separate candidates
        //    "Node.js (Express, Koa)" -> base="Node.js", parens=["Express", "Koa"]
        String base = cleaned;
        if (cleaned.contains("(") && cleaned.contains(")")) {
            int openIdx = cleaned.indexOf('(');
            int closeIdx = cleaned.lastIndexOf(')');
            base = cleaned.substring(0, openIdx).trim();
            String parenContent = cleaned.substring(openIdx + 1, closeIdx).trim();

            for (String part : parenContent.split(",")) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    results.addAll(splitOnSlash(trimmed));
                }
            }
        }

        // 4. Split the base on "/" (respecting known compounds)
        if (!base.isEmpty()) {
            results.addAll(0, splitOnSlash(base));
        }

        return results;
    }

    /**
     * Splits a string on "/" unless the whole string is a known compound term.
     */
    private List<String> splitOnSlash(String input) {
        List<String> results = new ArrayList<>();

        for (String compound : SLASH_COMPOUNDS) {
            if (compound.equalsIgnoreCase(input.trim())) {
                results.add(input.trim());
                return results;
            }
        }

        if (input.contains("/")) {
            for (String part : input.split("/")) {
                String trimmed = TRAILING_PUNCT.matcher(part.trim()).replaceFirst("");
                if (!trimmed.isEmpty()) {
                    results.add(trimmed);
                }
            }
        } else {
            results.add(input.trim());
        }

        return results;
    }

    // ── Resolution ───────────────────────────────────────────────────

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
        if (exactSkill.isPresent()) {
            System.out.println(">>>   [RESOLVE] \"" + rawSkill + "\" -> exact match -> \"" + exactSkill.get().getName() + "\" (" + exactSkill.get().getId() + ")");
            return exactSkill.get().getId();
        }

        // --- Use skill alias table
        Optional<Skill> aliasSkill = skillRepository.findByAliasIgnoreCase(rawSkill);
        if (aliasSkill.isPresent()) {
            System.out.println(">>>   [RESOLVE] \"" + rawSkill + "\" -> alias match -> \"" + aliasSkill.get().getName() + "\" (" + aliasSkill.get().getId() + ")");
            return aliasSkill.get().getId();
        }

        // --- No match found | TODO: resolve later
        System.out.println(">>>   [RESOLVE] \"" + rawSkill + "\" -> NO MATCH");
        return null;
    }
}
