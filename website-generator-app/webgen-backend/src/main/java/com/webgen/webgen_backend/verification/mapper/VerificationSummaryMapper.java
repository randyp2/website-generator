package com.webgen.webgen_backend.verification.mapper;

import com.webgen.webgen_backend.verification.dto.summary.VerificationClaimScoreDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSuggestedActionDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimScore;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillScoreSummary;
import com.webgen.webgen_backend.verification.service.scoring.model.SuggestedAction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
}
