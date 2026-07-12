package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class VerificationSignalPolicyTest {

    private final VerificationSignalPolicy policy = new VerificationSignalPolicy();

    @Test
    void graduallyUnlocksReviewedScoreCapFromEvidenceDepthWithoutThresholdJump() {
        assertThat(policy.claimScoreCap(null)).isEqualTo(80);
        assertThat(policy.claimScoreCap(new BigDecimal("0.849"))).isEqualTo(80);
        assertThat(policy.claimScoreCap(new BigDecimal("0.850"))).isEqualTo(80);
        assertThat(policy.claimScoreCap(new BigDecimal("0.875"))).isEqualTo(85);
        assertThat(policy.claimScoreCap(new BigDecimal("0.900"))).isEqualTo(90);
        assertThat(policy.claimScoreCap(new BigDecimal("0.925"))).isEqualTo(95);
        assertThat(policy.claimScoreCap(new BigDecimal("0.950"))).isEqualTo(100);
        assertThat(policy.claimScoreCap(BigDecimal.ONE)).isEqualTo(100);
    }

    @Test
    void onlyManualReviewSignalsQualifyForReviewedStatus() {
        assertThat(policy.isEligibleForReviewedStatus(
                "manual_upload", "llm_document_match", new BigDecimal("0.85"))).isTrue();
        assertThat(policy.isEligibleForReviewedStatus(
                "manual_upload", "llm_document_match", new BigDecimal("0.849"))).isFalse();
        assertThat(policy.isEligibleForReviewedStatus(
                "github", "dependency_match", BigDecimal.ONE)).isFalse();
    }

    @Test
    void repositoryNamesAndDescriptionsRemainDiscoveryOnly() {
        assertThat(policy.isScoringEligibleLinkType("description_match")).isFalse();
        assertThat(policy.linkTypeWeight("description_match")).isEqualByComparingTo("0");
        assertThat(policy.isScoringEligibleLinkType("name_match")).isFalse();
        assertThat(policy.linkTypeWeight("name_match")).isEqualByComparingTo("0");
        assertThat(policy.isScoringEligibleLinkType("dependency_match")).isTrue();
    }
}
