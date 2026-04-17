package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.resume_verification_service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SuggestedAction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class SkillVerificationScoringKernelTest {

    private final SkillVerificationScoringKernel kernel =
            new SkillVerificationScoringKernel(
                    new SkillScoringPolicy(),
                    new SkillSuggestedActionRuleBook(),
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

        assertThat(summary.baselineOverallScore()).isEqualTo(35);
        assertThat(summary.evidenceDelta()).isZero();
        assertThat(summary.overallScore()).isEqualTo(35);
        assertThat(summary.totalSkills()).isEqualTo(4);
        assertThat(summary.matchedSkills()).isEqualTo(2);
        assertThat(summary.unmatchedSkills()).isEqualTo(2);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        assertThat(byId.get(c1).claimScore()).isEqualTo(49);
        assertThat(byId.get(c1).baselineClaimScore()).isEqualTo(49);
        assertThat(byId.get(c1).evidenceContribution()).isZero();
        assertThat(byId.get(c1).evidenceLinksUsed()).isZero();
        assertThat(byId.get(c2).claimScore()).isEqualTo(24);
        assertThat(byId.get(c3).claimScore()).isEqualTo(40);
        assertThat(byId.get(c4).claimScore()).isEqualTo(27);

        assertThat(summary.unverifiedClaims()).hasSize(3);
        assertThat(summary.unverifiedClaims()).noneMatch(c -> c.claimId().equals(c3));
    }

    @Test
    void blendsParserConfidenceWhenProvided() {
        UUID c1 = UUID.randomUUID();
        UUID c2 = UUID.randomUUID();
        UUID skillOne = UUID.randomUUID();

        List<SkillClaimInput> claims = List.of(
                claim(c1, "React", skillOne, "React", "resume", "pending", "engineering", "1.0"),
                claim(c2, "Unknown", null, null, "manual", "pending", null, null)
        );

        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(claims, new BigDecimal("0.90")));

        assertThat(summary.scoreType()).isEqualTo("initial_with_parser_confidence");
        assertThat(summary.parserConfidence()).isEqualByComparingTo("0.90");
        assertThat(summary.baselineOverallScore()).isEqualTo(38);
        assertThat(summary.evidenceDelta()).isZero();
        assertThat(summary.overallScore()).isEqualTo(38);
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
        assertThat(first.action()).isEqualTo("Review/Rename claim");

        assertThat(summary.suggestedActions())
                .anyMatch(a -> a.claimId().equals(matchedClaimId) && a.action().equals("Connect GitHub"));
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
        assertThat(summary.baselineOverallScore()).isEqualTo(32);
        assertThat(summary.overallScore()).isEqualTo(38);
        assertThat(summary.evidenceDelta()).isEqualTo(6);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        SkillClaimScore evidenceClaim = byId.get(c1);
        assertThat(evidenceClaim.baselineClaimScore()).isEqualTo(49);
        assertThat(evidenceClaim.claimScore()).isEqualTo(61);
        assertThat(evidenceClaim.evidenceContribution()).isEqualTo(12);
        assertThat(evidenceClaim.evidenceLinksUsed()).isEqualTo(1);
        assertThat(evidenceClaim.scoreReasonCode()).isEqualTo("evidence_boost_recent_strong");
    }

    @Test
    void weakEvidenceCanDecreaseClaimAndOverallScores() {
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
        assertThat(summary.baselineOverallScore()).isEqualTo(49);
        assertThat(summary.overallScore()).isEqualTo(49);
        assertThat(summary.evidenceDelta()).isZero();

        assertThat(claimScore.baselineClaimScore()).isEqualTo(49);
        assertThat(claimScore.claimScore()).isEqualTo(49);
        assertThat(claimScore.evidenceContribution()).isZero();
        assertThat(claimScore.evidenceLinksUsed()).isEqualTo(1);
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
        OffsetDateTime now = OffsetDateTime.parse("2026-04-16T00:00:00Z");
        return new EvidenceLinkSignal(
                UUID.randomUUID(),
                "dependency_match",
                BigDecimal.ONE,
                BigDecimal.ONE,
                now,
                now,
                0,
                BigDecimal.ONE,
                new BigDecimal(decayedStrength),
                "test",
                "test-title",
                "https://example.test"
        );
    }
}
