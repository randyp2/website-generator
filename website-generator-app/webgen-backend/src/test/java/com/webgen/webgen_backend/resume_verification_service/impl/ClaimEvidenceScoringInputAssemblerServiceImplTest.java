package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.*;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.impl.ClaimEvidenceScoringInputAssemblerServiceImpl;
import com.webgen.webgen_backend.verification.service.scoring.IndependentEvidenceSelector;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

class ClaimEvidenceScoringInputAssemblerServiceImplTest {

    @Test
    void assembleSkillClaimInputsAppliesDeterministicTopKOrdering() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");

        Claim claim = buildClaim(profileId, claimId, skillId, "React");
        Skill skill = buildSkill(skillId, "React", "engineering", "1.0");

        List<ClaimEvidenceLink> links = new ArrayList<>();
        List<Evidence> evidenceRows = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            UUID evidenceId = new UUID(0L, i + 1L);
            OffsetDateTime capturedAt = asOf.minusDays(i);

            links.add(buildLink(profileId, claimId, evidenceId, "dependency_match", "1.0"));
            evidenceRows.add(buildEvidence(profileId, evidenceId, null, capturedAt, "repo-" + i));
        }

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(links),
                stubEvidenceRepository(evidenceRows),
                new VerificationSignalPolicy(),
                new IndependentEvidenceSelector()
        );

        List<SkillClaimInput> out = assembler.assembleSkillClaimInputs(
                profileId,
                List.of(claim),
                Map.of(skillId, skill),
                asOf
        );

        assertThat(out).hasSize(1);
        List<EvidenceLinkSignal> signals = out.getFirst().evidenceLinks();

        assertThat(signals).hasSize(10);
        assertThat(signals.getFirst().evidenceId()).isEqualTo(new UUID(0L, 1L));
        assertThat(signals.getLast().evidenceId()).isEqualTo(new UUID(0L, 10L));
        assertThat(signals).allSatisfy(signal -> assertThat(signal.linkTypeWeight())
                .isEqualByComparingTo("1.00"));
    }

    @Test
    void assembleSkillClaimInputsBreaksTiesByCapturedAtThenEvidenceId() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");

        Claim claim = buildClaim(profileId, claimId, skillId, "TypeScript");
        Skill skill = buildSkill(skillId, "TypeScript", "engineering", "1.0");

        UUID idA = new UUID(0L, 3L);
        UUID idB = new UUID(0L, 1L);
        UUID idC = new UUID(0L, 2L);

        List<ClaimEvidenceLink> links = List.of(
                buildLink(profileId, claimId, idA, "dependency_match", "0.9"),
                buildLink(profileId, claimId, idB, "dependency_match", "0.9"),
                buildLink(profileId, claimId, idC, "dependency_match", "0.9")
        );

        List<Evidence> evidenceRows = List.of(
                buildEvidence(profileId, idA, asOf.minusDays(5), asOf.minusDays(1), "A"),
                buildEvidence(profileId, idB, asOf.minusDays(5), asOf.minusDays(1), "B"),
                buildEvidence(profileId, idC, asOf.minusDays(5), asOf.minusDays(2), "C")
        );

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(links),
                stubEvidenceRepository(evidenceRows),
                new VerificationSignalPolicy(),
                new IndependentEvidenceSelector()
        );

        List<SkillClaimInput> out = assembler.assembleSkillClaimInputs(
                profileId,
                List.of(claim),
                Map.of(skillId, skill),
                asOf
        );

        List<EvidenceLinkSignal> signals = out.getFirst().evidenceLinks();
        assertThat(signals).extracting(EvidenceLinkSignal::evidenceId)
                .containsExactly(idB, idA, idC);
    }

    @Test
    void assembleSkillClaimInputsUsesDefaultWeightAndClampsConfidence() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");

        Claim claim = buildClaim(profileId, claimId, skillId, "GraphQL");
        Skill skill = buildSkill(skillId, "GraphQL", "engineering", "1.0");
        UUID evidenceId = new UUID(0L, 77L);

        ClaimEvidenceLink link = buildLink(profileId, claimId, evidenceId, " CUSTOM_SIGNAL ", "1.9");
        Evidence evidence = buildEvidence(
                profileId,
                evidenceId,
                asOf.plusDays(3),
                asOf.minusDays(1),
                "custom"
        );

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(List.of(link)),
                stubEvidenceRepository(List.of(evidence)),
                new VerificationSignalPolicy(),
                new IndependentEvidenceSelector()
        );

        List<SkillClaimInput> out = assembler.assembleSkillClaimInputs(
                profileId,
                List.of(claim),
                Map.of(skillId, skill),
                asOf
        );

        EvidenceLinkSignal signal = out.getFirst().evidenceLinks().getFirst();
        assertThat(signal.linkType()).isEqualTo("custom_signal");
        assertThat(signal.linkTypeWeight()).isEqualByComparingTo("0.50");
        assertThat(signal.linkConfidence()).isEqualByComparingTo("1.0");
        assertThat(signal.ageDays()).isZero();
        assertThat(signal.recencyDecay()).isEqualByComparingTo("1.00000000");
        assertThat(signal.decayedStrength()).isEqualByComparingTo("0.50000000");
    }

    @Test
    void reviewedUploadUsesEvidenceDepthInsteadOfMatchConfidenceForStrength() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID evidenceId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");

        ClaimEvidenceLink link = buildLink(
                profileId, claimId, evidenceId, "llm_document_match", "0.97");
        link.setEvidenceDepth(new BigDecimal("0.32"));
        Evidence evidence = buildEvidence(profileId, evidenceId, asOf, asOf, "portfolio.pdf");
        evidence.setProvider("manual_upload");

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(List.of(link)),
                stubEvidenceRepository(List.of(evidence)),
                new VerificationSignalPolicy(),
                new IndependentEvidenceSelector());

        EvidenceLinkSignal signal = assembler.assembleSkillClaimInputs(
                        profileId,
                        List.of(buildClaim(profileId, claimId, skillId, "React")),
                        Map.of(skillId, buildSkill(skillId, "React", "engineering", "1.0")),
                        asOf)
                .getFirst().evidenceLinks().getFirst();

        assertThat(signal.linkConfidence()).isEqualByComparingTo("0.97");
        assertThat(signal.evidenceDepth()).isEqualByComparingTo("0.32");
        assertThat(signal.decayedStrength()).isEqualByComparingTo("0.32000000");
    }

    @Test
    void keepsOnlyStrongestSignalFromEachEvidenceGroupBeforeTopK() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");
        UUID strongId = new UUID(0L, 1L);
        UUID duplicateId = new UUID(0L, 2L);
        UUID independentId = new UUID(0L, 3L);

        List<ClaimEvidenceLink> links = List.of(
                buildLink(profileId, claimId, strongId, "dependency_match", "0.95"),
                buildLink(profileId, claimId, duplicateId, "dependency_match", "0.90"),
                buildLink(profileId, claimId, independentId, "language_plus_text_match", "0.80"));
        Evidence strong = buildEvidence(profileId, strongId, asOf, asOf, "strong");
        Evidence duplicate = buildEvidence(profileId, duplicateId, asOf, asOf, "duplicate");
        Evidence independent = buildEvidence(profileId, independentId, asOf, asOf, "independent");
        strong.setEvidenceGroupKey("manual_upload:etag:same-object");
        duplicate.setEvidenceGroupKey("manual_upload:etag:same-object");
        independent.setEvidenceGroupKey("github:repository:42");

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler =
                new ClaimEvidenceScoringInputAssemblerServiceImpl(
                        stubClaimEvidenceLinkRepository(links),
                        stubEvidenceRepository(List.of(strong, duplicate, independent)),
                        new VerificationSignalPolicy(),
                        new IndependentEvidenceSelector());

        List<EvidenceLinkSignal> signals = assembler.assembleSkillClaimInputs(
                        profileId,
                        List.of(buildClaim(profileId, claimId, skillId, "React")),
                        Map.of(skillId, buildSkill(skillId, "React", "engineering", "1.0")),
                        asOf)
                .getFirst().evidenceLinks();

        assertThat(signals).extracting(EvidenceLinkSignal::evidenceId)
                .containsExactly(strongId, independentId);
        assertThat(signals).extracting(EvidenceLinkSignal::evidenceGroupKey)
                .containsExactly("manual_upload:etag:same-object", "github:repository:42");
    }

    @Test
    void appliesAuthorshipWeightToGithubRepositoryStrength() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID evidenceId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");
        ClaimEvidenceLink link = buildLink(
                profileId, claimId, evidenceId, "dependency_match", "1.0");
        Evidence evidence = buildEvidence(profileId, evidenceId, asOf, asOf, "fork");
        ObjectNode metadata = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
        metadata.putObject("authorship").put("weight", new BigDecimal("0.30"));
        evidence.setMetadata(metadata);

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler =
                new ClaimEvidenceScoringInputAssemblerServiceImpl(
                        stubClaimEvidenceLinkRepository(List.of(link)),
                        stubEvidenceRepository(List.of(evidence)),
                        new VerificationSignalPolicy(),
                        new IndependentEvidenceSelector());

        EvidenceLinkSignal signal = assembler.assembleSkillClaimInputs(
                        profileId,
                        List.of(buildClaim(profileId, claimId, skillId, "React")),
                        Map.of(skillId, buildSkill(skillId, "React", "engineering", "1.0")),
                        asOf)
                .getFirst().evidenceLinks().getFirst();

        assertThat(signal.decayedStrength()).isEqualByComparingTo("0.30000000");
    }

    @Test
    void excludesMetadataOnlyMatchesFromScoringInputs() {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        UUID descriptionEvidenceId = UUID.randomUUID();
        UUID nameEvidenceId = UUID.randomUUID();
        OffsetDateTime asOf = OffsetDateTime.parse("2026-04-16T00:00:00Z");
        List<ClaimEvidenceLink> links = List.of(
                buildLink(profileId, claimId, descriptionEvidenceId, "description_match", "0.90"),
                buildLink(profileId, claimId, nameEvidenceId, "name_match", "0.90"));
        List<Evidence> evidenceRows = List.of(
                buildEvidence(profileId, descriptionEvidenceId, asOf, asOf, "description"),
                buildEvidence(profileId, nameEvidenceId, asOf, asOf, "name"));

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler =
                new ClaimEvidenceScoringInputAssemblerServiceImpl(
                        stubClaimEvidenceLinkRepository(links),
                        stubEvidenceRepository(evidenceRows),
                        new VerificationSignalPolicy(),
                        new IndependentEvidenceSelector());

        List<EvidenceLinkSignal> signals = assembler.assembleSkillClaimInputs(
                        profileId,
                        List.of(buildClaim(profileId, claimId, skillId, "React")),
                        Map.of(skillId, buildSkill(skillId, "React", "engineering", "1.0")),
                        asOf)
                .getFirst().evidenceLinks();

        assertThat(signals).isEmpty();
    }

    @SuppressWarnings("unchecked")
    private ClaimEvidenceLinkRepository stubClaimEvidenceLinkRepository(List<ClaimEvidenceLink> links) {
        return (ClaimEvidenceLinkRepository) Proxy.newProxyInstance(
                ClaimEvidenceLinkRepository.class.getClassLoader(),
                new Class[]{ClaimEvidenceLinkRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileIdAndClaimIdIn".equals(method.getName())) {
                        return links;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private EvidenceRepository stubEvidenceRepository(List<Evidence> evidenceRows) {
        Map<UUID, Evidence> byId = new HashMap<>();
        evidenceRows.forEach(evidence -> byId.put(evidence.getId(), evidence));

        return (EvidenceRepository) Proxy.newProxyInstance(
                EvidenceRepository.class.getClassLoader(),
                new Class[]{EvidenceRepository.class},
                (proxy, method, args) -> {
                    if ("findAllById".equals(method.getName())) {
                        Iterable<UUID> ids = (Iterable<UUID>) args[0];
                        List<Evidence> out = new ArrayList<>();
                        for (UUID id : ids) {
                            Evidence evidence = byId.get(id);
                            if (evidence != null) {
                                out.add(evidence);
                            }
                        }
                        return out;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName
            );
        };
    }

    private Claim buildClaim(UUID profileId, UUID claimId, UUID skillId, String rawValue) {
        return Claim.builder()
                .id(claimId)
                .profile(profile(profileId))
                .claimType("skill")
                .rawValue(rawValue)
                .canonicalSkillId(skillId)
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

    private ClaimEvidenceLink buildLink(
            UUID profileId,
            UUID claimId,
            UUID evidenceId,
            String linkType,
            String confidence
    ) {
        return ClaimEvidenceLink.builder()
                .id(UUID.randomUUID())
                .profile(profile(profileId))
                .claimId(claimId)
                .evidenceId(evidenceId)
                .linkType(linkType)
                .linkConfidence(new BigDecimal(confidence))
                .reason("test-link")
                .createdAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                .updatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    private Evidence buildEvidence(
            UUID profileId,
            UUID evidenceId,
            OffsetDateTime occurredAt,
            OffsetDateTime capturedAt,
            String title
    ) {
        return Evidence.builder()
                .id(evidenceId)
                .profile(profile(profileId))
                .provider("github")
                .externalId("repo:" + evidenceId)
                .evidenceType("repository")
                .title(title)
                .sourceUrl("https://example.test/" + evidenceId)
                .occurredAt(occurredAt)
                .capturedAt(capturedAt)
                .createdAt(capturedAt)
                .updatedAt(capturedAt)
                .build();
    }

    private Profile profile(UUID profileId) {
        Profile profile = new Profile();
        profile.setId(profileId);
        return profile;
    }
}
