package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.mapper.VerificationSummaryMapper;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.verification.repository.SkillRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceScoringInputAssemblerService;
import com.webgen.webgen_backend.verification.service.impl.SkillVerificationSummaryServiceImpl;
import com.webgen.webgen_backend.verification.service.scoring.SkillScoringPolicy;
import com.webgen.webgen_backend.verification.service.scoring.SkillSuggestedActionRuleBook;
import com.webgen.webgen_backend.verification.service.scoring.SkillVerificationScoringKernel;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SkillVerificationSummaryServiceImplTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final SkillVerificationScoringKernel kernel =
            new SkillVerificationScoringKernel(
                    new SkillScoringPolicy(),
                    new VerificationSignalPolicy(),
                    new SkillSuggestedActionRuleBook(),
                    List.of()
            );

    @Test
    void noClaimsYieldsZeroSummary() {
        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(), List.of(), Optional.empty(), List.of()
        );

        VerificationSummaryDTO dto = service.getSkillVerificationSummary(UUID.randomUUID());

        assertThat(dto.getOverallScore()).isZero();
        assertThat(dto.getTotalSkills()).isZero();
        assertThat(dto.getMatchedSkills()).isZero();
        assertThat(dto.getUnmatchedSkills()).isZero();
        assertThat(dto.getScoreType()).isEqualTo("initial");
    }

    @Test
    void returnsNullParserConfidenceWhenNoResumeVerification() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(buildClaim(profileId, claimId, skillId, "React")),
                List.of(buildSkill(skillId, "React", "engineering", "1.0")),
                Optional.empty(),
                List.of()
        );

        VerificationSummaryDTO dto = service.getSkillVerificationSummary(profileId);

        assertThat(dto.getParserConfidence()).isNull();
        assertThat(dto.getScoreType()).isEqualTo("initial");
    }

    @Test
    void extractsParserConfidenceFromParsedJson() throws Exception {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        ResumeVerification rv = buildResumeVerification(profileId,
                OBJECT_MAPPER.readTree("{\"confidenceScore\": 0.85}"));

        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(buildClaim(profileId, claimId, skillId, "React")),
                List.of(buildSkill(skillId, "React", "engineering", "1.0")),
                Optional.of(rv),
                List.of()
        );

        VerificationSummaryDTO dto = service.getSkillVerificationSummary(profileId);

        assertThat(dto.getParserConfidence()).isEqualByComparingTo("0.85");
        assertThat(dto.getScoreType()).isEqualTo("initial_with_parser_confidence");
    }

    @Test
    void returnsNullParserConfidenceWhenParsedJsonIsNull() {
        UUID profileId = UUID.randomUUID();

        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(), List.of(),
                Optional.of(buildResumeVerification(profileId, null)),
                List.of()
        );

        assertThat(service.getSkillVerificationSummary(profileId).getParserConfidence()).isNull();
    }

    @Test
    void returnsNullParserConfidenceWhenConfidenceScoreMissing() throws Exception {
        UUID profileId = UUID.randomUUID();

        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(), List.of(),
                Optional.of(buildResumeVerification(profileId,
                        OBJECT_MAPPER.readTree("{\"name\": \"Jane\"}"))),
                List.of()
        );

        assertThat(service.getSkillVerificationSummary(profileId).getParserConfidence()).isNull();
    }

    @Test
    void returnsNullParserConfidenceWhenConfidenceScoreIsNotNumeric() throws Exception {
        UUID profileId = UUID.randomUUID();

        SkillVerificationSummaryServiceImpl service = buildService(
                List.of(), List.of(),
                Optional.of(buildResumeVerification(profileId,
                        OBJECT_MAPPER.readTree("{\"confidenceScore\": \"high\"}"))),
                List.of()
        );

        assertThat(service.getSkillVerificationSummary(profileId).getParserConfidence()).isNull();
    }

    @Test
    void skillLookupExcludesClaimsWithNullCanonicalSkillId() {
        UUID profileId = UUID.randomUUID();
        List<UUID> capturedIds = new ArrayList<>();

        ClaimRepository claimRepo = stubClaimRepository(
                List.of(buildClaim(profileId, UUID.randomUUID(), null, "SomeTool"))
        );
        ResumeVerificationRepository rvRepo = stubResumeVerificationRepository(Optional.empty());
        ClaimEvidenceScoringInputAssemblerService assembler = stubAssembler(List.of());

        SkillRepository capturingSkillRepo = (SkillRepository) Proxy.newProxyInstance(
                SkillRepository.class.getClassLoader(),
                new Class[]{SkillRepository.class},
                (proxy, method, args) -> {
                    if ("findAllById".equals(method.getName())) {
                        Iterable<UUID> ids = (Iterable<UUID>) args[0];
                        ids.forEach(capturedIds::add);
                        return List.of();
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        new SkillVerificationSummaryServiceImpl(
                claimRepo, capturingSkillRepo, rvRepo, assembler, kernel, buildPassThroughMapper()
        ).getSkillVerificationSummary(profileId);

        assertThat(capturedIds).isEmpty();
    }

    @Test
    void mixedClaimsOnlyLookUpSkillsForMatchedOnes() {
        UUID profileId = UUID.randomUUID();
        UUID matchedSkillId = UUID.randomUUID();
        List<UUID> capturedIds = new ArrayList<>();

        List<Claim> claims = List.of(
                buildClaim(profileId, UUID.randomUUID(), matchedSkillId, "React"),
                buildClaim(profileId, UUID.randomUUID(), null, "SomeTool"),
                buildClaim(profileId, UUID.randomUUID(), null, "Legacy")
        );

        ClaimRepository claimRepo = stubClaimRepository(claims);
        ResumeVerificationRepository rvRepo = stubResumeVerificationRepository(Optional.empty());
        ClaimEvidenceScoringInputAssemblerService assembler = stubAssembler(List.of());

        SkillRepository capturingSkillRepo = (SkillRepository) Proxy.newProxyInstance(
                SkillRepository.class.getClassLoader(),
                new Class[]{SkillRepository.class},
                (proxy, method, args) -> {
                    if ("findAllById".equals(method.getName())) {
                        Iterable<UUID> ids = (Iterable<UUID>) args[0];
                        ids.forEach(capturedIds::add);
                        return List.of();
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        new SkillVerificationSummaryServiceImpl(
                claimRepo, capturingSkillRepo, rvRepo, assembler, kernel, buildPassThroughMapper()
        ).getSkillVerificationSummary(profileId);

        assertThat(capturedIds).containsExactly(matchedSkillId);
    }

    // ─── Builder helpers ─────────────────────────────────────────────────────

    private SkillVerificationSummaryServiceImpl buildService(
            List<Claim> claims,
            List<Skill> skills,
            Optional<ResumeVerification> resumeVerification,
            List<SkillClaimInput> assembledInputs
    ) {
        return new SkillVerificationSummaryServiceImpl(
                stubClaimRepository(claims),
                stubSkillRepository(skills),
                stubResumeVerificationRepository(resumeVerification),
                stubAssembler(assembledInputs),
                kernel,
                buildPassThroughMapper()
        );
    }

    private VerificationSummaryMapper buildPassThroughMapper() {
        return (VerificationSummaryMapper) Proxy.newProxyInstance(
                VerificationSummaryMapper.class.getClassLoader(),
                new Class[]{VerificationSummaryMapper.class},
                (proxy, method, args) -> {
                    if ("toSummaryDto".equals(method.getName())) {
                        SkillScoreSummary s = (SkillScoreSummary) args[0];
                        VerificationSummaryDTO dto = new VerificationSummaryDTO();
                        dto.setScoreType(s.scoreType());
                        dto.setOverallScore(s.overallScore());
                        dto.setBaselineOverallScore(s.baselineOverallScore());
                        dto.setEvidenceDelta(s.evidenceDelta());
                        dto.setTotalSkills(s.totalSkills());
                        dto.setMatchedSkills(s.matchedSkills());
                        dto.setUnmatchedSkills(s.unmatchedSkills());
                        dto.setParserConfidence(s.parserConfidence());
                        dto.setClaims(List.of());
                        dto.setUnverifiedClaims(List.of());
                        dto.setSuggestedActions(List.of());
                        return dto;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ClaimRepository stubClaimRepository(List<Claim> claims) {
        return (ClaimRepository) Proxy.newProxyInstance(
                ClaimRepository.class.getClassLoader(),
                new Class[]{ClaimRepository.class},
                (proxy, method, args) -> {
                    if ("findSkillClaimsByProfileId".equals(method.getName())) return claims;
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private SkillRepository stubSkillRepository(List<Skill> skills) {
        return (SkillRepository) Proxy.newProxyInstance(
                SkillRepository.class.getClassLoader(),
                new Class[]{SkillRepository.class},
                (proxy, method, args) -> {
                    if ("findAllById".equals(method.getName())) return skills;
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ResumeVerificationRepository stubResumeVerificationRepository(
            Optional<ResumeVerification> result) {
        return (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileId".equals(method.getName())) return result;
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ClaimEvidenceScoringInputAssemblerService stubAssembler(List<SkillClaimInput> inputs) {
        return (ClaimEvidenceScoringInputAssemblerService) Proxy.newProxyInstance(
                ClaimEvidenceScoringInputAssemblerService.class.getClassLoader(),
                new Class[]{ClaimEvidenceScoringInputAssemblerService.class},
                (proxy, method, args) -> {
                    if ("assembleSkillClaimInputs".equals(method.getName())) return inputs;
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException("Unexpected method: " + methodName);
        };
    }

    private Claim buildClaim(UUID profileId, UUID claimId, UUID canonicalSkillId, String rawValue) {
        Profile profile = new Profile();
        profile.setId(profileId);
        return Claim.builder()
                .id(claimId)
                .profile(profile)
                .claimType("skill")
                .rawValue(rawValue)
                .canonicalSkillId(canonicalSkillId)
                .source("resume")
                .status("pending")
                .createdAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                .updatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    private Skill buildSkill(UUID id, String name, String category, String weight) {
        Skill skill = new Skill();
        skill.setId(id);
        skill.setName(name);
        skill.setCategory(category);
        skill.setWeight(new BigDecimal(weight));
        return skill;
    }

    private ResumeVerification buildResumeVerification(UUID profileId, JsonNode parsedJson) {
        Profile profile = new Profile();
        profile.setId(profileId);
        ResumeVerification rv = new ResumeVerification();
        rv.setId(UUID.randomUUID());
        rv.setProfile(profile);
        rv.setParsedJson(parsedJson);
        rv.setOriginalFileName("resume.pdf");
        rv.setContentType("application/pdf");
        rv.setFileSizeBytes(1024L);
        rv.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        rv.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return rv;
    }
}
