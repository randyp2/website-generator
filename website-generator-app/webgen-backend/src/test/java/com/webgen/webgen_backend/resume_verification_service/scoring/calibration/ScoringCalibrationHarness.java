package com.webgen.webgen_backend.resume_verification_service.scoring.calibration;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.impl.ClaimEvidenceScoringInputAssemblerServiceImpl;
import com.webgen.webgen_backend.verification.service.scoring.ClaimScoreNarrator;
import com.webgen.webgen_backend.verification.service.scoring.EvidenceNudgeCalculator;
import com.webgen.webgen_backend.verification.service.scoring.IndependentEvidenceSelector;
import com.webgen.webgen_backend.verification.service.scoring.SkillScoringPolicy;
import com.webgen.webgen_backend.verification.service.scoring.SkillSuggestedActionRuleBook;
import com.webgen.webgen_backend.verification.service.scoring.SkillVerificationScoringKernel;
import com.webgen.webgen_backend.verification.service.scoring.SuggestedActionBuilder;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Runs realistic scoring scenarios through the real assembler and scoring kernel. */
final class ScoringCalibrationHarness {

    private static final OffsetDateTime AS_OF = OffsetDateTime.parse("2026-07-12T00:00:00Z");

    CalibrationResult run(CalibrationScenario scenario) {
        UUID profileId = UUID.nameUUIDFromBytes(
                ("profile:" + scenario.id()).getBytes(StandardCharsets.UTF_8));
        Profile profile = new Profile();
        profile.setId(profileId);

        List<Claim> claims = new ArrayList<>();
        List<ClaimEvidenceLink> links = new ArrayList<>();
        List<Evidence> evidenceRows = new ArrayList<>();
        Map<UUID, Skill> skillsById = new HashMap<>();

        for (int claimIndex = 0; claimIndex < scenario.claims().size(); claimIndex++) {
            ClaimSpec claimSpec = scenario.claims().get(claimIndex);
            UUID claimId = deterministicId(scenario.id(), "claim", claimIndex);
            UUID skillId = deterministicId(scenario.id(), "skill", claimIndex);
            claims.add(buildClaim(profile, claimId, skillId, claimSpec.skillName()));
            skillsById.put(skillId, buildSkill(skillId, claimSpec.skillName()));

            for (int evidenceIndex = 0; evidenceIndex < claimSpec.evidence().size(); evidenceIndex++) {
                EvidenceSpec evidenceSpec = claimSpec.evidence().get(evidenceIndex);
                UUID evidenceId = deterministicId(
                        scenario.id() + ':' + claimIndex, "evidence", evidenceIndex);
                evidenceRows.add(buildEvidence(profile, evidenceId, evidenceSpec));
                links.add(buildLink(profile, claimId, evidenceId, evidenceSpec));
            }
        }

        VerificationSignalPolicy signalPolicy = new VerificationSignalPolicy();
        ClaimEvidenceScoringInputAssemblerServiceImpl assembler =
                new ClaimEvidenceScoringInputAssemblerServiceImpl(
                        linkRepository(links),
                        evidenceRepository(evidenceRows),
                        signalPolicy,
                        new IndependentEvidenceSelector());
        List<SkillClaimInput> inputs = assembler.assembleSkillClaimInputs(
                profileId, claims, skillsById, AS_OF);

        SkillScoringPolicy scoringPolicy = new SkillScoringPolicy();
        SkillVerificationScoringKernel kernel = new SkillVerificationScoringKernel(
                scoringPolicy,
                new EvidenceNudgeCalculator(scoringPolicy, signalPolicy),
                new ClaimScoreNarrator(scoringPolicy),
                new SuggestedActionBuilder(scoringPolicy, new SkillSuggestedActionRuleBook()),
                List.of());
        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(inputs, null, AS_OF));
        return new CalibrationResult(scenario, summary);
    }

    private Claim buildClaim(Profile profile, UUID claimId, UUID skillId, String skillName) {
        return Claim.builder()
                .id(claimId)
                .profile(profile)
                .claimType("skill")
                .rawValue(skillName)
                .canonicalSkillId(skillId)
                .source("resume")
                .status("pending")
                .createdAt(AS_OF.minusDays(30))
                .updatedAt(AS_OF.minusDays(30))
                .build();
    }

    private Skill buildSkill(UUID skillId, String skillName) {
        Skill skill = new Skill();
        skill.setId(skillId);
        skill.setName(skillName);
        skill.setCategory("engineering");
        skill.setWeight(BigDecimal.ONE);
        return skill;
    }

    private Evidence buildEvidence(Profile profile, UUID evidenceId, EvidenceSpec spec) {
        ObjectNode metadata = JsonNodeFactory.instance.objectNode();
        if ("github".equals(spec.provider())) {
            metadata.putObject("authorship").put("weight", spec.authorshipWeight());
            metadata.putObject("repositoryIndependence")
                    .put("weight", spec.independenceWeight());
        }
        OffsetDateTime occurredAt = AS_OF.minusDays(spec.ageDays());
        return Evidence.builder()
                .id(evidenceId)
                .profile(profile)
                .provider(spec.provider())
                .externalId("calibration:" + evidenceId)
                .evidenceGroupKey(spec.groupKey())
                .evidenceType(spec.evidenceType())
                .title(spec.label())
                .sourceUrl("https://example.test/" + evidenceId)
                .occurredAt(occurredAt)
                .capturedAt(AS_OF)
                .metadata(metadata)
                .createdAt(AS_OF)
                .updatedAt(AS_OF)
                .build();
    }

    private ClaimEvidenceLink buildLink(
            Profile profile,
            UUID claimId,
            UUID evidenceId,
            EvidenceSpec spec
    ) {
        return ClaimEvidenceLink.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .claimId(claimId)
                .evidenceId(evidenceId)
                .linkType(spec.linkType())
                .linkConfidence(spec.matchConfidence())
                .evidenceDepth(spec.evidenceDepth())
                .reason("calibration scenario")
                .metadata(JsonNodeFactory.instance.objectNode())
                .createdAt(AS_OF)
                .updatedAt(AS_OF)
                .build();
    }

    private ClaimEvidenceLinkRepository linkRepository(List<ClaimEvidenceLink> links) {
        return proxyRepository(
                ClaimEvidenceLinkRepository.class,
                "findByProfileIdAndClaimIdIn",
                links);
    }

    @SuppressWarnings("unchecked")
    private EvidenceRepository evidenceRepository(List<Evidence> evidenceRows) {
        Map<UUID, Evidence> evidenceById = new HashMap<>();
        evidenceRows.forEach(evidence -> evidenceById.put(evidence.getId(), evidence));
        return (EvidenceRepository) Proxy.newProxyInstance(
                EvidenceRepository.class.getClassLoader(),
                new Class[]{EvidenceRepository.class},
                (proxy, method, args) -> {
                    if ("findAllById".equals(method.getName())) {
                        List<Evidence> found = new ArrayList<>();
                        for (UUID id : (Iterable<UUID>) args[0]) {
                            if (evidenceById.containsKey(id)) {
                                found.add(evidenceById.get(id));
                            }
                        }
                        return found;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                });
    }

    @SuppressWarnings("unchecked")
    private <T> T proxyRepository(Class<T> type, String methodName, Object result) {
        return (T) Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class[]{type},
                (proxy, method, args) -> methodName.equals(method.getName())
                        ? result
                        : handleObjectMethod(proxy, method.getName(), args));
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "calibrationRepositoryProxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName);
        };
    }

    private UUID deterministicId(String scenarioId, String type, int index) {
        return UUID.nameUUIDFromBytes(
                (scenarioId + ':' + type + ':' + index).getBytes(StandardCharsets.UTF_8));
    }

    record CalibrationScenario(String id, String description, List<ClaimSpec> claims) {}

    record ClaimSpec(String skillName, List<EvidenceSpec> evidence) {}

    record EvidenceSpec(
            String label,
            String provider,
            String evidenceType,
            String groupKey,
            String linkType,
            BigDecimal matchConfidence,
            BigDecimal evidenceDepth,
            BigDecimal authorshipWeight,
            BigDecimal independenceWeight,
            int ageDays
    ) {}

    record CalibrationResult(CalibrationScenario scenario, SkillScoreSummary summary) {
        int overallScore() {
            return summary.overallScore();
        }

        int evidenceDelta() {
            return summary.evidenceDelta();
        }

        String claimScores() {
            return summary.claims().stream()
                    .map(ScoringCalibrationHarness.CalibrationResult::formatClaim)
                    .reduce((left, right) -> left + ", " + right)
                    .orElse("none");
        }

        private static String formatClaim(SkillClaimScore claim) {
            return claim.rawValue() + '=' + claim.claimScore()
                    + " (links " + claim.evidenceLinksUsed() + ')';
        }
    }
}
