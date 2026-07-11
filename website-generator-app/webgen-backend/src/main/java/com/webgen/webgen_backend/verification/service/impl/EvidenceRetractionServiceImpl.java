package com.webgen.webgen_backend.verification.service.impl;

import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService;
import com.webgen.webgen_backend.verification.service.EvidenceRetractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvidenceRetractionServiceImpl implements EvidenceRetractionService {

    private final EvidenceRepository evidenceRepository;
    private final ClaimEvidenceLinkRepository linkRepository;
    private final ClaimVerificationStatusService statusService;

    @Override
    public int retractUpload(UUID profileId, UUID uploadId) {
        List<Evidence> evidence = evidenceRepository.findByProfileIdAndSourceUploadId(profileId, uploadId)
                .map(List::of).orElseGet(List::of);
        return retract(profileId, "upload:" + uploadId, evidence);
    }

    @Override
    public int retractProvider(UUID profileId, String provider) {
        return retract(profileId, "provider:" + provider,
                evidenceRepository.findByProfileIdAndProvider(profileId, provider));
    }

    private int retract(UUID profileId, String source, List<Evidence> evidence) {
        if (evidence.isEmpty()) {
            return 0;
        }
        List<UUID> evidenceIds = evidence.stream().map(Evidence::getId).toList();
        List<ClaimEvidenceLink> links = linkRepository.findByProfileIdAndEvidenceIdIn(profileId, evidenceIds);
        Set<UUID> affectedClaims = links.stream().map(ClaimEvidenceLink::getClaimId).collect(Collectors.toSet());
        linkRepository.deleteAll(links);
        evidenceRepository.deleteAll(evidence);
        linkRepository.flush();
        evidenceRepository.flush();
        statusService.reconcileClaims(profileId, affectedClaims);
        log.info("Verification evidence retracted profileId={} source={} evidence={} links={} claims={}",
                profileId, source, evidence.size(), links.size(), affectedClaims.size());
        return evidence.size();
    }
}
