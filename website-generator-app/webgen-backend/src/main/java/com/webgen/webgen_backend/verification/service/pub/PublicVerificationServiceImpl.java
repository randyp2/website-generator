package com.webgen.webgen_backend.verification.service.pub;

import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.service.ProfileService;
import com.webgen.webgen_backend.verification.dto.pub.PublicClaimDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceListResponseDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationSummaryDTO;
import com.webgen.webgen_backend.verification.mapper.PublicVerificationMapper;
import com.webgen.webgen_backend.verification.service.ClaimIngestionService;
import com.webgen.webgen_backend.verification.service.ConnectionService;
import com.webgen.webgen_backend.verification.service.EvidenceQueryService;
import com.webgen.webgen_backend.verification.service.SkillVerificationSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicVerificationServiceImpl implements PublicVerificationService {

    private final ProfileService profileService;
    private final SkillVerificationSummaryService skillVerificationSummaryService;
    private final ClaimIngestionService claimIngestionService;
    private final ConnectionService connectionService;
    private final EvidenceQueryService evidenceQueryService;
    private final PublicVerificationMapper publicVerificationMapper;

    @Override
    public Optional<PublicVerificationSummaryDTO> getSummaryByUsername(String username) {
        return resolveProfileId(username)
                .map(skillVerificationSummaryService::getSkillVerificationSummary)
                .map(publicVerificationMapper::toPublicSummaryDto);
    }

    @Override
    public Optional<PublicVerificationSummaryDTO> getSummaryByProfileId(UUID profileId) {
        if (profileId == null) {
            return Optional.empty();
        }

        return Optional.of(skillVerificationSummaryService.getSkillVerificationSummary(profileId))
                .map(publicVerificationMapper::toPublicSummaryDto);
    }

    @Override
    public Optional<List<PublicClaimDTO>> getClaimsByUsername(String username) {
        return resolveProfileId(username)
                .map(claimIngestionService::getSkillClaims)
                .map(publicVerificationMapper::toPublicClaimDtos);
    }

    @Override
    public Optional<List<PublicConnectedAccountDTO>> getConnectionsByUsername(String username) {
        return resolveProfileId(username)
                .map(connectionService::getConnections)
                .map(publicVerificationMapper::toPublicConnectedAccountDtos);
    }

    @Override
    public Optional<PublicEvidenceListResponseDTO> getEvidenceByUsername(
            String username,
            String provider
    ) {
        return resolveProfileId(username)
                .map(profileId -> evidenceQueryService.getEvidence(profileId, provider))
                .map(publicVerificationMapper::toPublicEvidenceListResponseDto);
    }

    private Optional<UUID> resolveProfileId(String username) {
        return profileService.getPublicProfileByUsername(username)
                .map(PublicProfileDTO::getId);
    }
}
