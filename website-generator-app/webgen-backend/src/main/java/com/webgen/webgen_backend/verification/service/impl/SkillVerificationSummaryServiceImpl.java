package com.webgen.webgen_backend.verification.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.mapper.VerificationSummaryMapper;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.verification.repository.SkillRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceScoringInputAssemblerService;
import com.webgen.webgen_backend.verification.service.SkillVerificationSummaryService;
import com.webgen.webgen_backend.verification.service.scoring.SkillVerificationScoringKernel;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreRequest;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillVerificationSummaryServiceImpl implements SkillVerificationSummaryService {

    private final ClaimRepository claimRepository;
    private final SkillRepository skillRepository;
    private final ResumeVerificationRepository resumeVerificationRepository;
    private final ClaimEvidenceScoringInputAssemblerService claimEvidenceScoringInputAssemblerService;

    private final SkillVerificationScoringKernel scoringKernel;

    private final VerificationSummaryMapper verificationSummaryMapper;

    @Override
    public VerificationSummaryDTO getSkillVerificationSummary(UUID profileId) {
        List<Claim> skillClaims = claimRepository.findSkillClaimsByProfileId(profileId);

        Map<UUID, Skill> canonicalSkillsById = loadCanonicalSkills(skillClaims);
        BigDecimal parserConfidence = resolveParserConfidence(profileId);
        OffsetDateTime asOf = OffsetDateTime.now();

        List<SkillClaimInput> inputs = claimEvidenceScoringInputAssemblerService.assembleSkillClaimInputs(
                profileId,
                skillClaims,
                canonicalSkillsById,
                asOf
        );

        SkillScoreSummary summary = scoringKernel.score(new SkillScoreRequest(inputs, parserConfidence, asOf));
        return verificationSummaryMapper.toSummaryDto(summary);
    }

    /**
     * Loads canonical skills referenced by claims in one batch query.
     *
     * @param claims raw persisted claims
     * @return map of canonical skill id to skill entity
     */
    private Map<UUID, Skill> loadCanonicalSkills(List<Claim> claims) {
        Set<UUID> ids = claims.stream()
                .map(Claim::getCanonicalSkillId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            return Map.of();
        }

        return skillRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Skill::getId, Function.identity()));
    }

    /**
     * Extracts optional parser confidence from the latest persisted parsed resume JSON.
     *
     * @param profileId authenticated profile id
     * @return confidence in range [0,1] when available, otherwise null
     */
    private BigDecimal resolveParserConfidence(UUID profileId) {
        return resumeVerificationRepository.findByProfileId(profileId)
                .map(rv -> extractParserConfidence(rv.getParsedJson()))
                .orElse(null);
    }

    /**
     * Reads `confidenceScore` from parsed resume JSON if present.
     *
     * @param parsedJson persisted parsed resume payload
     * @return confidence value when numeric, otherwise null
     */
    private BigDecimal extractParserConfidence(JsonNode parsedJson) {
        if (parsedJson == null) {
            return null;
        }

        JsonNode node = parsedJson.get("confidenceScore");
        if (node == null || !node.isNumber()) {
            return null;
        }

        return BigDecimal.valueOf(node.asDouble());
    }

}
