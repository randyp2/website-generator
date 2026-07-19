package com.webgen.webgen_backend.verification.mapper;

import com.webgen.webgen_backend.verification.dto.summary.VerificationClaimScoreDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSuggestedActionDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.verification.service.scoring.model.SuggestedAction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;

import java.time.OffsetDateTime;
import java.util.List;

@Mapper(componentModel = "spring", imports = OffsetDateTime.class)
public interface VerificationSummaryMapper {

    @Mapping(source = "claimId", target = "id")
    VerificationClaimScoreDTO toClaimDto(SkillClaimScore score);

    List<VerificationClaimScoreDTO> toClaimDtos(List<SkillClaimScore> scores);

    VerificationSuggestedActionDTO toActionDto(SuggestedAction action);

    List<VerificationSuggestedActionDTO> toActionDtos(List<SuggestedAction> actions);

    @Mapping(target = "generatedAt", expression = "java(OffsetDateTime.now())")
    VerificationSummaryDTO toSummaryDto(SkillScoreSummary summary);

    /** Adds assurance dimensions without changing the backwards-compatible score fields. */
    @AfterMapping
    default void addVerificationDimensions(
            SkillScoreSummary summary,
            @MappingTarget VerificationSummaryDTO target
    ) {
        int matched = Math.max(0, summary.matchedSkills());
        long evidenced = summary.claims().stream()
                .filter(claim -> claim.matched() && claim.evidenceLinksUsed() > 0)
                .count();
        int evidencePoints = summary.claims().stream()
                .filter(claim -> claim.matched())
                .mapToInt(claim -> Math.max(0, claim.evidenceContribution()))
                .sum();
        boolean aiReviewed = summary.claims().stream().anyMatch(claim -> "verified".equals(claim.status()));
        boolean corroborated = evidenced > 0;

        target.setRecognitionCoverage(summary.normalizedCoverage());
        target.setEvidenceCoverage(ratio(evidenced, matched));
        target.setEvidenceStrength(ratio(evidencePoints, matched * 100L));
        target.setVerificationTier(aiReviewed ? "ai_reviewed" : corroborated ? "corroborated" : "self_declared");
        target.setScoreLabel("evidence_score");
    }

    private static java.math.BigDecimal ratio(long numerator, long denominator) {
        if (denominator <= 0) return java.math.BigDecimal.ZERO;
        return java.math.BigDecimal.valueOf(numerator)
                .divide(java.math.BigDecimal.valueOf(denominator), 6, java.math.RoundingMode.HALF_UP);
    }
}
