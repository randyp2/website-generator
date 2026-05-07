package com.webgen.webgen_backend.verification.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.dto.ClaimDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceSummaryDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.verification.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.verification.repository.SkillRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceReadService;
import com.webgen.webgen_backend.verification.service.ClaimIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ClaimIngestionServiceImpl implements ClaimIngestionService {


    private final ClaimRepository claimRepository;
    private final SkillRepository skillRepository;
    private final ResumeVerificationRepository resumeVerificationRepository;
    private final ProfileRepository profileRepository;
    private final ClaimEvidenceReadService claimEvidenceReadService;

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
        List<Claim> claims = claimRepository.findByProfileId(profileId).stream()
                .filter(c -> "skill".equals(c.getClaimType()))
                .toList();

        if (claims.isEmpty()) {
            return List.of();
        }

        List<ClaimDTO> dtoList = claims.stream()
                .map(this::toDto)
                .toList();

        List<UUID> claimIds = claims.stream().map(Claim::getId).toList();
        Map<UUID, ClaimEvidenceSummaryDTO> evidenceSummaryByClaimId = claimEvidenceReadService
                .getEvidenceSummariesByClaimIds(profileId, claimIds);

        dtoList.forEach(dto -> dto.setEvidenceSummary(
                evidenceSummaryByClaimId.getOrDefault(
                        dto.getId(),
                        emptyEvidenceSummary(dto.getId()))
        ));

        return dtoList;
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
        dto.setEvidenceSummary(emptyEvidenceSummary(claim.getId()));
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());

        // Resolve canonical skill name for display
        if (claim.getCanonicalSkillId() != null) {
            skillRepository.findById(claim.getCanonicalSkillId())
                    .ifPresent(skill -> dto.setCanonicalSkillName(skill.getName()));
        }

        return dto;
    }

    /** Builds a default empty evidence summary for claim DTO hydration. */
    private ClaimEvidenceSummaryDTO emptyEvidenceSummary(UUID claimId) {
        return ClaimEvidenceSummaryDTO.builder()
                .claimId(claimId)
                .linkedEvidenceCount(0)
                .linkedEvidence(List.of())
                .build();
    }

    // ── Pre-normalization ──────────────────────────────────────────────

    /** Label prefixes like "Languages:", "Frameworks:", "Tools:" etc. */
    private static final Pattern LABEL_PREFIX = Pattern.compile("^[A-Za-z &/]+:\\s*");

    /** Trailing punctuation that isn't part of a skill name. */
    private static final Pattern TRAILING_PUNCT = Pattern.compile("[.,;:!?]+$");

    /** Balanced parenthetical groups used for extraction before cleanup. */
    private static final Pattern PAREN_CONTENT = Pattern.compile("\\(([^)]*)\\)");

    /** Wrapper characters to trim from token edges after splitting. */
    private static final String TOKEN_WRAPPERS = "()[]{}\"'`";

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
     *   2. Extract balanced parenthetical items as separate candidates
     *      ("Node.js (Express)" -> ["Node.js", "Express"])
     *   3. Replace unmatched parentheses with delimiters for recovery
     *      ("AWS (ECS" -> ["AWS", "ECS"], "S3)" -> ["S3"])
     *   4. Split on "," and "/" unless "/" term is a known compound
     *      ("React/Redux" -> ["React", "Redux"])
     *      ("CI/CD" -> ["CI/CD"])
     *   5. Deduplicate case-insensitively while preserving first-seen order
     */
    private List<String> normalizeAndSplit(String raw) {
        List<String> candidates = new ArrayList<>();
        if (raw == null) {
            return candidates;
        }

        // 1) Strip label prefix
        String cleaned = LABEL_PREFIX.matcher(raw).replaceFirst("").trim();
        if (cleaned.isEmpty()) {
            return candidates;
        }

        // 2) Pull balanced parenthetical chunks first
        Matcher matcher = PAREN_CONTENT.matcher(cleaned);
        while (matcher.find()) {
            addDelimitedTokens(matcher.group(1), candidates);
        }

        // 3) Replace extracted groups with delimiters, then recover unmatched
        String base = matcher.replaceAll(",");
        base = base.replace('(', ',').replace(')', ',');

        // 4) Split remaining payload by comma and slash
        addDelimitedTokens(base, candidates);

        // 5) Deduplicate case-insensitively with stable ordering
        return dedupeCaseInsensitive(candidates);
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

    /**
     * Splits one chunk by comma and slash, then sanitizes each token.
     */
    private void addDelimitedTokens(String chunk, List<String> out) {
        if (chunk == null || out == null) {
            return;
        }

        for (String commaPart : chunk.split(",")) {
            if (commaPart == null || commaPart.isBlank()) {
                continue;
            }

            for (String slashPart : splitOnSlash(commaPart)) {
                String token = sanitizeToken(slashPart);
                if (!token.isEmpty()) {
                    out.add(token);
                }
            }
        }
    }

    /**
     * Cleans token edges without damaging core skill punctuation
     * (for example C++, Node.js, CI/CD).
     */
    private String sanitizeToken(String token) {
        if (token == null) {
            return "";
        }

        String cleaned = token.trim();
        cleaned = TRAILING_PUNCT.matcher(cleaned).replaceFirst("").trim();

        while (!cleaned.isEmpty() && TOKEN_WRAPPERS.indexOf(cleaned.charAt(0)) >= 0) {
            cleaned = cleaned.substring(1).trim();
        }
        while (!cleaned.isEmpty() && TOKEN_WRAPPERS.indexOf(cleaned.charAt(cleaned.length() - 1)) >= 0) {
            cleaned = cleaned.substring(0, cleaned.length() - 1).trim();
        }

        cleaned = TRAILING_PUNCT.matcher(cleaned).replaceFirst("").trim();
        return cleaned.replaceAll("\\s+", " ");
    }

    /**
     * Preserves first-seen display token and removes duplicates case-insensitively.
     */
    private List<String> dedupeCaseInsensitive(List<String> tokens) {
        List<String> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (String token : tokens) {
            String cleaned = sanitizeToken(token);
            if (cleaned.isEmpty()) {
                continue;
            }

            String key = cleaned.toLowerCase(Locale.ROOT);
            if (seen.add(key)) {
                out.add(cleaned);
            }
        }
        return out;
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
