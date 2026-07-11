package com.webgen.webgen_backend.resume_verification_service.scoring;

import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.mapper.VerificationSummaryMapperImpl;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VerificationSummaryDimensionsTest {

    @Test
    void separatesRecognitionEvidenceAndAssuranceTierFromCombinedScore() {
        SkillClaimScore reviewed = claim("verified", true, 2, 24);
        SkillClaimScore selfDeclared = claim("needs_evidence", true, 0, 0);
        SkillScoreSummary summary = new SkillScoreSummary(
                "evidence_enhanced", 56, 12, 68, 2, 2, 0,
                BigDecimal.ONE, new BigDecimal("0.8"), null, "Evidence improved the score.",
                List.of(reviewed, selfDeclared), List.of(selfDeclared), List.of());

        VerificationSummaryDTO dto = new VerificationSummaryMapperImpl().toSummaryDto(summary);

        assertThat(dto.getScoreLabel()).isEqualTo("evidence_score");
        assertThat(dto.getRecognitionCoverage()).isEqualByComparingTo("1");
        assertThat(dto.getEvidenceCoverage()).isEqualByComparingTo("0.5");
        assertThat(dto.getEvidenceStrength()).isEqualByComparingTo("0.12");
        assertThat(dto.getVerificationTier()).isEqualTo("ai_reviewed");
        assertThat(dto.getOverallScore()).isEqualTo(68);
    }

    private SkillClaimScore claim(String status, boolean matched, int links, int contribution) {
        return new SkillClaimScore(
                UUID.randomUUID(), "Java", UUID.randomUUID(), "Java", "resume", status,
                matched, "recognized", "engineering", BigDecimal.ONE,
                56, contribution, links, 56 + contribution, "reason", "Reason");
    }
}
