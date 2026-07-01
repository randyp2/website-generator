package com.webgen.webgen_backend.verification.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceSummaryDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimLinkedEvidenceDTO;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimEvidenceReadServiceImpl implements ClaimEvidenceReadService {

    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final EvidenceRepository evidenceRepository;

    @Override
    public Map<UUID, ClaimEvidenceSummaryDTO> getEvidenceSummariesByClaimIds(
            UUID profileId,
            List<UUID> claimIds) {
        if (profileId == null || claimIds == null || claimIds.isEmpty()) {
            return Map.of();
        }

        List<UUID> distinctClaimIds = claimIds.stream()
                .filter(id -> id != null)
                .distinct()
                .toList();
        if (distinctClaimIds.isEmpty()) {
            return Map.of();
        }

        List<ClaimEvidenceLink> links = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdIn(profileId, distinctClaimIds);
        if (links.isEmpty()) {
            return distinctClaimIds.stream()
                    .collect(Collectors.toMap(
                            Function.identity(),
                            this::buildEmptySummary));
        }

        Map<UUID, List<ClaimEvidenceLink>> linksByClaimId = links.stream()
                .collect(Collectors.groupingBy(ClaimEvidenceLink::getClaimId));

        List<UUID> evidenceIds = links.stream()
                .map(ClaimEvidenceLink::getEvidenceId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<UUID, Evidence> evidenceById = evidenceRepository.findAllById(evidenceIds).stream()
                .filter(evidence -> evidence.getProfile() != null
                        && profileId.equals(evidence.getProfile().getId()))
                .collect(Collectors.toMap(Evidence::getId, Function.identity()));

        return distinctClaimIds.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        claimId -> buildSummary(claimId, linksByClaimId.get(claimId), evidenceById)));
    }

    /** Builds claim-level summary payload from preloaded link/evidence rows. */
    private ClaimEvidenceSummaryDTO buildSummary(
            UUID claimId,
            List<ClaimEvidenceLink> links,
            Map<UUID, Evidence> evidenceById) {
        if (links == null || links.isEmpty()) {
            return buildEmptySummary(claimId);
        }

        List<ClaimLinkedEvidenceDTO> linkedEvidence = links.stream()
                .sorted(Comparator.comparing(ClaimEvidenceLink::getUpdatedAt).reversed())
                .map(link -> toLinkedEvidenceDto(link, evidenceById.get(link.getEvidenceId())))
                .filter(dto -> dto != null)
                .toList();

        return ClaimEvidenceSummaryDTO.builder()
                .claimId(claimId)
                .linkedEvidenceCount(linkedEvidence.size())
                .linkedEvidence(linkedEvidence)
                .build();
    }

    /** Maps one link + evidence pair into claim-centric response DTO. */
    private ClaimLinkedEvidenceDTO toLinkedEvidenceDto(
            ClaimEvidenceLink link,
            Evidence evidence) {
        if (link == null || evidence == null) {
            return null;
        }

        return ClaimLinkedEvidenceDTO.builder()
                .evidenceId(evidence.getId())
                .provider(evidence.getProvider())
                .externalId(evidence.getExternalId())
                .evidenceType(evidence.getEvidenceType())
                .title(evidence.getTitle())
                .sourceUrl(evidence.getSourceUrl())
                .capturedAt(evidence.getCapturedAt())
                .linkType(link.getLinkType())
                .linkConfidence(link.getLinkConfidence())
                .reason(link.getReason())
                .sourceFile(readSourceFile(link.getMetadata()))
                .build();
    }

    /** Reads the manifest file a dependency signal was found in, when recorded. */
    private String readSourceFile(JsonNode metadata) {
        if (metadata == null) {
            return null;
        }
        JsonNode sourceFile = metadata.get("source_file");
        return sourceFile != null && sourceFile.isTextual() ? sourceFile.asText() : null;
    }

    /** Returns a zero-link summary for claim ids without evidence links. */
    private ClaimEvidenceSummaryDTO buildEmptySummary(UUID claimId) {
        return ClaimEvidenceSummaryDTO.builder()
                .claimId(claimId)
                .linkedEvidenceCount(0)
                .linkedEvidence(List.of())
                .build();
    }
}
