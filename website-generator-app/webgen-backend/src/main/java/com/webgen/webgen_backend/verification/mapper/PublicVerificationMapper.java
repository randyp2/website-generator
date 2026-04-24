package com.webgen.webgen_backend.verification.mapper;

import com.webgen.webgen_backend.verification.dto.ClaimDTO;
import com.webgen.webgen_backend.verification.dto.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceSummaryDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimLinkedEvidenceDTO;
import com.webgen.webgen_backend.verification.dto.evidence.EvidenceDTO;
import com.webgen.webgen_backend.verification.dto.evidence.EvidenceLinkDTO;
import com.webgen.webgen_backend.verification.dto.evidence.EvidenceListResponseDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicClaimDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicClaimEvidenceSummaryDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicClaimLinkedEvidenceDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceLinkDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceListResponseDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationClaimScoreDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationSuggestedActionDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationSummaryDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationClaimScoreDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSuggestedActionDTO;
import com.webgen.webgen_backend.verification.dto.summary.VerificationSummaryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PublicVerificationMapper {

    /**
     * Maps verification summary data to a public-safe summary payload.
     *
     * @param summary internal verification summary DTO
     * @return public verification summary DTO
     */
    PublicVerificationSummaryDTO toPublicSummaryDto(VerificationSummaryDTO summary);

    /**
     * Maps claim score rows to public claim score rows.
     *
     * @param scores internal claim score DTO list
     * @return public claim score DTO list
     */
    List<PublicVerificationClaimScoreDTO> toPublicClaimScoreDtos(List<VerificationClaimScoreDTO> scores);

    /**
     * Maps suggested actions to public suggested actions.
     *
     * @param actions internal suggested actions
     * @return public suggested actions
     */
    List<PublicVerificationSuggestedActionDTO> toPublicActionDtos(List<VerificationSuggestedActionDTO> actions);

    /**
     * Maps skill claim rows to public claim rows.
     *
     * @param claims internal claim DTO list
     * @return public claim DTO list
     */
    List<PublicClaimDTO> toPublicClaimDtos(List<ClaimDTO> claims);

    /**
     * Maps claim evidence summary to public claim evidence summary.
     *
     * @param summary internal claim evidence summary
     * @return public claim evidence summary
     */
    PublicClaimEvidenceSummaryDTO toPublicClaimEvidenceSummaryDto(ClaimEvidenceSummaryDTO summary);

    /**
     * Maps linked evidence rows to public linked evidence rows.
     *
     * @param linkedEvidence internal linked evidence rows
     * @return public linked evidence rows
     */
    List<PublicClaimLinkedEvidenceDTO> toPublicClaimLinkedEvidenceDtos(List<ClaimLinkedEvidenceDTO> linkedEvidence);

    /**
     * Maps connected account rows to public connected account rows.
     *
     * @param accounts internal connected account rows
     * @return public connected account rows
     */
    List<PublicConnectedAccountDTO> toPublicConnectedAccountDtos(List<ConnectedAccountDTO> accounts);

    /**
     * Maps one connected account row to a public connected account row.
     *
     * @param account internal connected account DTO
     * @return public connected account DTO
     */
    @Mapping(source = "createdAt", target = "connectedAt")
    PublicConnectedAccountDTO toPublicConnectedAccountDto(ConnectedAccountDTO account);

    /**
     * Maps evidence listing payload to a public evidence listing payload.
     *
     * @param response internal evidence list response
     * @return public evidence list response
     */
    PublicEvidenceListResponseDTO toPublicEvidenceListResponseDto(EvidenceListResponseDTO response);

    /**
     * Maps evidence rows to public evidence rows.
     *
     * @param evidence internal evidence rows
     * @return public evidence rows
     */
    List<PublicEvidenceDTO> toPublicEvidenceDtos(List<EvidenceDTO> evidence);

    /**
     * Maps evidence links to public evidence links.
     *
     * @param links internal evidence links
     * @return public evidence links
     */
    List<PublicEvidenceLinkDTO> toPublicEvidenceLinkDtos(List<EvidenceLinkDTO> links);
}
