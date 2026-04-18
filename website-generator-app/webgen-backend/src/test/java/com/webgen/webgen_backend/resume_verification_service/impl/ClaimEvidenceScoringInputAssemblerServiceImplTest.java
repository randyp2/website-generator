package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.*;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.impl.ClaimEvidenceScoringInputAssemblerServiceImpl;
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

            links.add(buildLink(profileId, claimId, evidenceId, "name_match", "1.0"));
            evidenceRows.add(buildEvidence(profileId, evidenceId, null, capturedAt, "repo-" + i));
        }

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(links),
                stubEvidenceRepository(evidenceRows)
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
                .isEqualByComparingTo("0.72"));
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
                buildLink(profileId, claimId, idA, "topic_match", "0.9"),
                buildLink(profileId, claimId, idB, "topic_match", "0.9"),
                buildLink(profileId, claimId, idC, "topic_match", "0.9")
        );

        List<Evidence> evidenceRows = List.of(
                buildEvidence(profileId, idA, asOf.minusDays(5), asOf.minusDays(1), "A"),
                buildEvidence(profileId, idB, asOf.minusDays(5), asOf.minusDays(1), "B"),
                buildEvidence(profileId, idC, asOf.minusDays(5), asOf.minusDays(2), "C")
        );

        ClaimEvidenceScoringInputAssemblerServiceImpl assembler = new ClaimEvidenceScoringInputAssemblerServiceImpl(
                stubClaimEvidenceLinkRepository(links),
                stubEvidenceRepository(evidenceRows)
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
                stubEvidenceRepository(List.of(evidence))
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
