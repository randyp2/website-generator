package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.*;
import com.webgen.webgen_backend.verification.service.scoring.ClaimScoreNarrator;
import com.webgen.webgen_backend.verification.service.scoring.EvidenceNudgeCalculator;
import com.webgen.webgen_backend.verification.service.scoring.SkillScoringPolicy;
import com.webgen.webgen_backend.verification.service.scoring.SkillSuggestedActionRuleBook;
import com.webgen.webgen_backend.verification.service.scoring.SkillVerificationScoringKernel;
import com.webgen.webgen_backend.verification.service.scoring.SuggestedActionBuilder;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

class SkillVerificationScoringKernelTest {

    private final SkillScoringPolicy scoringPolicy = new SkillScoringPolicy();
    private final VerificationSignalPolicy verificationSignalPolicy = new VerificationSignalPolicy();

    private final SkillVerificationScoringKernel kernel =
            new SkillVerificationScoringKernel(
                    scoringPolicy,
                    new EvidenceNudgeCalculator(scoringPolicy, verificationSignalPolicy),
                    new ClaimScoreNarrator(scoringPolicy),
                    new SuggestedActionBuilder(scoringPolicy, new SkillSuggestedActionRuleBook()),
                    List.of()
            );

    @Test
    void emptyClaimsProduceZeroSummary() {
        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(List.of(), null));

        assertThat(summary.scoreType()).isEqualTo("initial");
        assertThat(summary.baselineOverallScore()).isZero();
        assertThat(summary.evidenceDelta()).isZero();
        assertThat(summary.overallScore()).isZero();
        assertThat(summary.totalSkills()).isZero();
        assertThat(summary.matchedSkills()).isZero();
        assertThat(summary.unmatchedSkills()).isZero();
        assertThat(summary.unverifiedClaims()).isEmpty();
        assertThat(summary.suggestedActions()).isEmpty();
    }

    @Test
    void computesDeterministicBaseScoreAndClaimScores() {
        UUID c1 = UUID.randomUUID();
        UUID c2 = UUID.randomUUID();
        UUID c3 = UUID.randomUUID();
        UUID c4 = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();
        UUID skillTwo = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claim(c1, "React", skillOne, "React", "resume", "pending", "engineering", "1.0"),
                claim(c2, "Legacy Tool", null, null, "resume", "pending", null, null),
                claim(c3, "Excel", skillTwo, "Excel", "manual", "verified", "business_sales", "0.6"),
                claim(c4, "Unknown", null, null, "imported", "needs_evidence", null, null)
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, null));

        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.evidenceDelta()).isZero();
        assertThat(summary.overallScore()).isEqualTo(50);
        assertThat(summary.totalSkills()).isEqualTo(4);
        assertThat(summary.matchedSkills()).isEqualTo(2);
        assertThat(summary.unmatchedSkills()).isEqualTo(2);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        assertThat(byId.get(c1).claimScore()).isEqualTo(50);
        assertThat(byId.get(c1).baselineClaimScore()).isEqualTo(50);
        assertThat(byId.get(c1).evidenceContribution()).isZero();
        assertThat(byId.get(c1).evidenceLinksUsed()).isZero();
        assertThat(byId.get(c2).claimScore()).isZero();
        assertThat(byId.get(c3).claimScore()).isEqualTo(50);
        assertThat(byId.get(c4).claimScore()).isZero();

        assertThat(summary.unverifiedClaims()).hasSize(3);
        assertThat(summary.unverifiedClaims()).noneMatch(c -> c.claimId().equals(c3));
    }

    @Test
    void retainsParserConfidenceWithoutChangingVerificationProgress() {
        UUID c1 = UUID.randomUUID();
        UUID c2 = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claim(c1, "React", skillOne, "React", "resume", "pending", "engineering", "1.0"),
                claim(c2, "Unknown", null, null, "manual", "pending", null, null)
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, new BigDecimal("0.90")));

        assertThat(summary.scoreType()).isEqualTo("initial");
        assertThat(summary.parserConfidence()).isEqualByComparingTo("0.90");
        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.evidenceDelta()).isZero();
        assertThat(summary.overallScore()).isEqualTo(50);
    }

    @Test
    void prioritizesUnresolvedClaimActionsFirst() {
        UUID unresolvedClaimId = UUID.randomUUID();
        UUID matchedClaimId = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claim(unresolvedClaimId, "Something", null, null, "resume", "pending", null, null),
                claim(matchedClaimId, "React", skillOne, "React", "resume", "pending", "engineering", "1.0")
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, null));

        SuggestedAction first = summary.suggestedActions().getFirst();
        assertThat(first.claimId()).isEqualTo(unresolvedClaimId);
        assertThat(first.action()).isEqualTo("Rename this skill");

        assertThat(summary.suggestedActions())
                .anyMatch(a -> a.claimId().equals(matchedClaimId) && a.action().equals("Connect GitHub"));
    }

    @Test
    void evidencedClaimSuggestsUpgradeInsteadOfRepeatingConnect() {
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        // Matched engineering claim that already has GitHub proof (caps at 80).
        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(List.of(
                claimWithEvidence(claimId, "React", skillId, "React", "resume", "pending", "engineering", "1.0",
                        List.of(evidence("1.0")))
        ), null));

        List<String> actions = summary.suggestedActions().stream()
                .filter(a -> a.claimId().equals(claimId))
                .map(SuggestedAction::action)
                .toList();

        assertThat(actions).contains("Upload a portfolio piece for an in-depth review", "Add a more recent project");
        assertThat(actions).doesNotContain("Connect GitHub", "Link portfolio project URL");
    }

    @Test
    void adequatelyEvidencedClaimSuggestsNoFurtherActions() {
        UUID claimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        // Strong, AI-reviewed evidence clears the expert ceiling (> 80), so there is
        // nothing left to nudge the user toward.
        List<EvidenceLinkSignal> expertSignals = List.of(
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95"))
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(List.of(
                claimWithEvidence(claimId, "React", skillId, "React", "resume", "pending", "engineering", "1.0",
                        expertSignals)
        ), null));

        assertThat(summary.claims().getFirst().claimScore()).isGreaterThan(80);
        assertThat(summary.suggestedActions()).noneMatch(a -> a.claimId().equals(claimId));
    }

    @Test
    void evidenceEnhancementAdjustsClaimAndOverallScores() {
        UUID c1 = UUID.randomUUID();
        UUID c2 = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claimWithEvidence(
                        c1,
                        "React",
                        skillOne,
                        "React",
                        "resume",
                        "pending",
                        "engineering",
                        "1.0",
                        List.of(evidence("1.0"))
                ),
                claim(c2, "Unknown", null, null, "manual", "pending", null, null)
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, null));

        assertThat(summary.scoreType()).isEqualTo("evidence_enhanced");
        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.overallScore()).isEqualTo(62);
        assertThat(summary.evidenceDelta()).isEqualTo(12);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        SkillClaimScore evidenceClaim = byId.get(c1);
        assertThat(evidenceClaim.baselineClaimScore()).isEqualTo(50);
        assertThat(evidenceClaim.claimScore()).isEqualTo(62);
        assertThat(evidenceClaim.evidenceContribution()).isEqualTo(12);
        assertThat(evidenceClaim.evidenceLinksUsed()).isEqualTo(1);
        assertThat(evidenceClaim.scoreReasonCode()).isEqualTo("evidence_boost_recent_strong");
    }

    @Test
    void sparseEvidenceIsNotDilutedByUnevidencedSkills() {
        // Four recognized resume skills, only one of which has strong, fresh proof.
        // That skill earns a +12 lift on its own card (baseline 50). A raw
        // mean-over-all-matched formula would divide that lift across all four
        // skills. The coverage-damped formula averages over
        // only the evidenced skill, then re-applies breadth as a damped multiplier:
        // 12 * (1/4)^0.5 = 12 * 0.5 = +6 -> overall 56.
        UUID evidencedId = UUID.randomUUID();
        UUID bare1 = UUID.randomUUID();
        UUID bare2 = UUID.randomUUID();
        UUID bare3 = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claimWithEvidence(
                        evidencedId,
                        "React",
                        UUID.randomUUID(),
                        "React",
                        "resume",
                        "pending",
                        "engineering",
                        "1.0",
                        List.of(evidence("1.0"))
                ),
                claim(bare1, "Java", UUID.randomUUID(), "Java", "resume", "pending", "engineering", "1.0"),
                claim(bare2, "Spring", UUID.randomUUID(), "Spring", "resume", "pending", "engineering", "1.0"),
                claim(bare3, "Docker", UUID.randomUUID(), "Docker", "resume", "pending", "engineering", "1.0")
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, null));

        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.overallScore()).isEqualTo(56);
        assertThat(summary.evidenceDelta()).isEqualTo(6);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));
        // The per-claim card is unaffected: only the roll-up into the overall changed.
        assertThat(byId.get(evidencedId).claimScore()).isEqualTo(62);
        assertThat(byId.get(evidencedId).evidenceContribution()).isEqualTo(12);
    }

    @Test
    void broaderEvidenceCoverageScoresStrictlyHigherThanSparse() {
        // Same evidenced lift per skill, but more of the profile is backed. Breadth
        // must still win: higher coverage -> strictly higher overall score.
        UUID e1 = UUID.randomUUID();
        UUID e2 = UUID.randomUUID();
        UUID e3 = UUID.randomUUID();
        UUID bare = UUID.randomUUID();

        SkillScoreSummary sparse = kernel.score(new SkillScoreRequest(List.of(
                claimWithEvidence(e1, "React", UUID.randomUUID(), "React", "resume", "pending", "engineering", "1.0",
                        List.of(evidence("1.0"))),
                claim(bare, "Java", UUID.randomUUID(), "Java", "resume", "pending", "engineering", "1.0")
        ), null));

        SkillScoreSummary broad = kernel.score(new SkillScoreRequest(List.of(
                claimWithEvidence(e2, "React", UUID.randomUUID(), "React", "resume", "pending", "engineering", "1.0",
                        List.of(evidence("1.0"))),
                claimWithEvidence(e3, "Java", UUID.randomUUID(), "Java", "resume", "pending", "engineering", "1.0",
                        List.of(evidence("1.0")))
        ), null));

        assertThat(broad.overallScore()).isGreaterThan(sparse.overallScore());
    }

    @Test
    void weakEvidenceProducesOnlyAMinimalIncrease() {
        UUID c1 = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claimWithEvidence(
                        c1,
                        "React",
                        skillOne,
                        "React",
                        "resume",
                        "pending",
                        "engineering",
                        "1.0",
                        List.of(evidence("0.10"))
                )
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, null));
        SkillClaimScore claimScore = summary.claims().getFirst();

        assertThat(summary.scoreType()).isEqualTo("evidence_enhanced");
        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.overallScore()).isEqualTo(51);
        assertThat(summary.evidenceDelta()).isEqualTo(1);

        assertThat(claimScore.baselineClaimScore()).isEqualTo(50);
        assertThat(claimScore.claimScore()).isEqualTo(51);
        assertThat(claimScore.evidenceContribution()).isEqualTo(1);
        assertThat(claimScore.evidenceLinksUsed()).isEqualTo(1);
    }

    @Test
    void rejectedClaimsAreExcludedFromVerificationProgress() {
        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(List.of(
                claim(UUID.randomUUID(), "React", UUID.randomUUID(), "React",
                        "resume", "rejected", "engineering", "1.0"),
                claim(UUID.randomUUID(), "Java", UUID.randomUUID(), "Java",
                        "manual", "needs_evidence", "engineering", "1.0")
        ), null));

        assertThat(summary.totalSkills()).isOne();
        assertThat(summary.matchedSkills()).isOne();
        assertThat(summary.baselineOverallScore()).isEqualTo(50);
        assertThat(summary.claims()).extracting(SkillClaimScore::rawValue).containsExactly("Java");
    }

    @Test
    void moreEvidenceSignalsIncreaseClaimPriorAndFinalScore() {
        UUID oneLinkClaimId = UUID.randomUUID();
        UUID manyLinkClaimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(
                List.of(
                        claimWithEvidence(
                                oneLinkClaimId,
                                "React",
                                skillId,
                                "React",
                                "resume",
                                "pending",
                                "engineering",
                                "1.0",
                                List.of(evidence("0.50"))
                        ),
                        claimWithEvidence(
                                manyLinkClaimId,
                                "React",
                                skillId,
                                "React",
                                "resume",
                                "pending",
                                "engineering",
                                "1.0",
                                List.of(evidence("0.50"), evidence("0.50"), evidence("0.50"))
                        )
                ),
                null
        ));

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        SkillClaimScore oneLink = byId.get(oneLinkClaimId);
        SkillClaimScore manyLinks = byId.get(manyLinkClaimId);

        assertThat(manyLinks.baselineClaimScore()).isEqualTo(oneLink.baselineClaimScore());
        assertThat(manyLinks.evidenceContribution()).isGreaterThan(oneLink.evidenceContribution());
        assertThat(manyLinks.claimScore()).isGreaterThan(oneLink.claimScore());
    }

    @Test
    void manualUploadHighConfidenceSignalsUnlockExpertCap() {
        UUID manualUploadClaimId = UUID.randomUUID();
        UUID githubClaimId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();

        List<EvidenceLinkSignal> manualUploadSignals = List.of(
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95")),
                evidence("1.0", "manual_upload", "llm_document_match", new BigDecimal("0.95"))
        );
        List<EvidenceLinkSignal> githubSignals = List.of(
                evidence("1.0", "github", "dependency_match", new BigDecimal("0.95")),
                evidence("1.0", "github", "dependency_match", new BigDecimal("0.95")),
                evidence("1.0", "github", "dependency_match", new BigDecimal("0.95")),
                evidence("1.0", "github", "dependency_match", new BigDecimal("0.95")),
                evidence("1.0", "github", "dependency_match", new BigDecimal("0.95"))
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(
                List.of(
                        claimWithEvidence(
                                manualUploadClaimId,
                                "React",
                                skillId,
                                "React",
                                "resume",
                                "pending",
                                "engineering",
                                "1.0",
                                manualUploadSignals
                        ),
                        claimWithEvidence(
                                githubClaimId,
                                "React",
                                skillId,
                                "React",
                                "resume",
                                "pending",
                                "engineering",
                                "1.0",
                                githubSignals
                        )
                ),
                null
        ));

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        assertThat(byId.get(manualUploadClaimId).claimScore()).isGreaterThan(80);
        assertThat(byId.get(githubClaimId).claimScore()).isLessThanOrEqualTo(80);
    }

    private SkillClaimInput claim(
            UUID claimId,
            String rawValue,
            UUID canonicalSkillId,
            String canonicalSkillName,
            String source,
            String status,
            String category,
            String weight
    ) {
        return new SkillClaimInput(
                claimId,
                rawValue,
                canonicalSkillId,
                canonicalSkillName,
                source,
                status,
                category,
                weight == null ? null : new BigDecimal(weight)
        );
    }

    private SkillClaimInput claimWithEvidence(
            UUID claimId,
            String rawValue,
            UUID canonicalSkillId,
            String canonicalSkillName,
            String source,
            String status,
            String category,
            String weight,
            List<EvidenceLinkSignal> evidenceLinks
    ) {
        return new SkillClaimInput(
                claimId,
                rawValue,
                canonicalSkillId,
                canonicalSkillName,
                source,
                status,
                category,
                weight == null ? null : new BigDecimal(weight),
                evidenceLinks
        );
    }

    private EvidenceLinkSignal evidence(String decayedStrength) {
        return evidence(decayedStrength, "github", "dependency_match", BigDecimal.ONE);
    }

    private EvidenceLinkSignal evidence(
            String decayedStrength,
            String provider,
            String linkType,
            BigDecimal confidence
    ) {
        OffsetDateTime now = OffsetDateTime.parse("2026-04-16T00:00:00Z");
        return new EvidenceLinkSignal(
                UUID.randomUUID(),
                linkType,
                confidence,
                BigDecimal.ONE,
                now,
                now,
                0,
                BigDecimal.ONE,
                new BigDecimal(decayedStrength),
                "test",
                "test-title",
                "https://example.test",
                provider
        );
    }
}
