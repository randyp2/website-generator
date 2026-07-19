package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.ClaimScoreNarrator;
import com.webgen.webgen_backend.verification.service.scoring.EvidenceNudgeCalculator;
import com.webgen.webgen_backend.verification.service.scoring.SkillScoringPolicy;
import com.webgen.webgen_backend.verification.service.scoring.SkillSuggestedActionRuleBook;
import com.webgen.webgen_backend.verification.service.scoring.SkillVerificationScoringKernel;
import com.webgen.webgen_backend.verification.service.scoring.SuggestedActionBuilder;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewedEvidenceCapScoringTest {

    private final SkillVerificationScoringKernel kernel = buildKernel();

    @Test
    void gradualCapFlowsThroughClaimScoring() {
        int belowThreshold = scoreAtEvidenceDepth("0.849");
        int threshold = scoreAtEvidenceDepth("0.850");
        int partialUnlock = scoreAtEvidenceDepth("0.900");
        int fullUnlock = scoreAtEvidenceDepth("0.950");

        assertThat(threshold).isEqualTo(belowThreshold);
        assertThat(threshold).isLessThanOrEqualTo(80);
        assertThat(partialUnlock).isGreaterThan(threshold).isLessThanOrEqualTo(90);
        assertThat(fullUnlock).isGreaterThan(partialUnlock).isLessThanOrEqualTo(100);
    }

    private int scoreAtEvidenceDepth(String depth) {
        List<EvidenceLinkSignal> signals = IntStream.range(0, 10)
                .mapToObj(index -> reviewedSignal(new BigDecimal(depth)))
                .toList();
        SkillClaimInput claim = new SkillClaimInput(
                UUID.randomUUID(), "React", UUID.randomUUID(), "React",
                "manual", "corroborated", "engineering", BigDecimal.ONE, signals);
        return kernel.score(new SkillScoreRequest(List.of(claim), null))
                .claims().getFirst().claimScore();
    }

    private EvidenceLinkSignal reviewedSignal(BigDecimal evidenceDepth) {
        OffsetDateTime now = OffsetDateTime.parse("2026-07-11T00:00:00Z");
        return new EvidenceLinkSignal(
                UUID.randomUUID(), "llm_document_match", new BigDecimal("0.99"),
                evidenceDepth, BigDecimal.ONE,
                now, now, 0, BigDecimal.ONE, BigDecimal.ONE,
                "reviewed upload", "portfolio.pdf", null, "manual_upload");
    }

    private SkillVerificationScoringKernel buildKernel() {
        SkillScoringPolicy scoringPolicy = new SkillScoringPolicy();
        VerificationSignalPolicy signalPolicy = new VerificationSignalPolicy();
        return new SkillVerificationScoringKernel(
                scoringPolicy,
                new EvidenceNudgeCalculator(scoringPolicy, signalPolicy),
                new ClaimScoreNarrator(scoringPolicy),
                new SuggestedActionBuilder(scoringPolicy, new SkillSuggestedActionRuleBook()),
                List.of());
    }
}
