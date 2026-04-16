package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.evidence.EvidenceDTO;
import com.webgen.webgen_backend.dto.profile.verification.evidence.EvidenceLinkDTO;
import com.webgen.webgen_backend.dto.profile.verification.evidence.EvidenceListResponseDTO;
import com.webgen.webgen_backend.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.entity.Evidence;
import com.webgen.webgen_backend.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.repository.EvidenceRepository;
import com.webgen.webgen_backend.resume_verification_service.EvidenceQueryService;
import com.webgen.webgen_backend.resume_verification_service.shared.ProviderNormalizationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceQueryServiceImpl implements EvidenceQueryService {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of(
            "linkedin",
            "github",
            "website",
            "other"
    );

    private final EvidenceRepository evidenceRepository;
    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;

    @Override
    public EvidenceListResponseDTO getEvidence(UUID profileId, String provider) {
        List<Evidence> evidenceRows = resolveEvidenceRows(profileId, provider);
        if (evidenceRows.isEmpty()) {
            return EvidenceListResponseDTO.builder()
                    .items(List.of())
                    .nextCursor(null)
                    .build();
        }

        Map<UUID, List<ClaimEvidenceLink>> linksByEvidenceId = loadLinksByEvidenceId(
                profileId,
                evidenceRows
        );

        List<EvidenceDTO> items = evidenceRows.stream()
                .map(evidence -> toDto(
                        profileId,
                        evidence,
                        linksByEvidenceId.getOrDefault(evidence.getId(), List.of())))
                .toList();

        return EvidenceListResponseDTO.builder()
                .items(items)
                .nextCursor(null)
                .build();
    }

    /**
     * Resolves evidence rows with optional provider filter.
     */
    private List<Evidence> resolveEvidenceRows(UUID profileId, String provider) {
        if (provider == null || provider.isBlank()) {
            return evidenceRepository.findByProfileIdOrderByCapturedAtDesc(profileId);
        }

        String normalizedProvider = ProviderNormalizationHelper.normalizeProvider(
                provider,
                SUPPORTED_PROVIDERS
        );
        return evidenceRepository.findByProfileIdAndProviderOrderByCapturedAtDesc(
                profileId,
                normalizedProvider
        );
    }

    /**
     * Loads all claim-evidence links for the current evidence page in one query.
     */
    private Map<UUID, List<ClaimEvidenceLink>> loadLinksByEvidenceId(
            UUID profileId,
            List<Evidence> evidenceRows
    ) {
        List<UUID> evidenceIds = evidenceRows.stream()
                .map(Evidence::getId)
                .toList();

        return claimEvidenceLinkRepository.findByProfileIdAndEvidenceIdIn(profileId, evidenceIds).stream()
                .collect(Collectors.groupingBy(ClaimEvidenceLink::getEvidenceId));
    }

    /**
     * Maps a persistence evidence row and links to API DTO.
     */
    private EvidenceDTO toDto(
            UUID profileId,
            Evidence evidence,
            List<ClaimEvidenceLink> links
    ) {
        List<EvidenceLinkDTO> linkDtos = links.stream()
                .sorted(Comparator.comparing(ClaimEvidenceLink::getUpdatedAt).reversed())
                .map(this::toLinkDto)
                .toList();

        return EvidenceDTO.builder()
                .id(evidence.getId())
                .profileId(profileId)
                .provider(evidence.getProvider())
                .externalId(evidence.getExternalId())
                .evidenceType(evidence.getEvidenceType())
                .title(evidence.getTitle())
                .description(evidence.getDescription())
                .sourceUrl(evidence.getSourceUrl())
                .occurredAt(evidence.getOccurredAt())
                .capturedAt(evidence.getCapturedAt())
                .metadata(evidence.getMetadata())
                .createdAt(evidence.getCreatedAt())
                .updatedAt(evidence.getUpdatedAt())
                .links(linkDtos)
                .build();
    }

    /**
     * Maps claim-evidence link row to lightweight evidence link DTO.
     */
    private EvidenceLinkDTO toLinkDto(ClaimEvidenceLink link) {
        return EvidenceLinkDTO.builder()
                .claimId(link.getClaimId())
                .linkType(link.getLinkType())
                .linkConfidence(link.getLinkConfidence())
                .reason(link.getReason())
                .build();
    }
}
