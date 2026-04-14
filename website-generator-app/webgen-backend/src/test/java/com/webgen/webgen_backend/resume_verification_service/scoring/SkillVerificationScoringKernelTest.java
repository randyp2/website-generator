package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.resume_verification_service.scoring.model.SuggestedAction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class SkillVerificationScoringKernelTest {

    private final SkillVerificationScoringKernel kernel =
            new SkillVerificationScoringKernel(new SkillScoringPolicy(), new SkillSuggestedActionRuleBook());

    @Test
    void emptyClaimsProduceZeroSummary() {
        SkillScoreSummary summary = kernel.score(new SkillScoreRequest(List.of(), null));

        assertThat(summary.scoreType()).isEqualTo("initial");
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

        assertThat(summary.overallScore()).isEqualTo(58);
        assertThat(summary.totalSkills()).isEqualTo(4);
        assertThat(summary.matchedSkills()).isEqualTo(2);
        assertThat(summary.unmatchedSkills()).isEqualTo(2);

        Map<UUID, SkillClaimScore> byId = summary.claims().stream()
                .collect(Collectors.toMap(SkillClaimScore::claimId, Function.identity()));

        assertThat(byId.get(c1).claimScore()).isEqualTo(94);
        assertThat(byId.get(c2).claimScore()).isEqualTo(24);
        assertThat(byId.get(c3).claimScore()).isEqualTo(85);
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
        assertThat(summary.overallScore()).isEqualTo(58);
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
}
