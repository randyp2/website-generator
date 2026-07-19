package com.webgen.webgen_backend.verification.service.impl;

import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Applies one status policy after every evidence mutation. */
@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimVerificationStatusServiceImpl implements ClaimVerificationStatusService {

    private static final Set<String> MANUAL_STATES = Set.of("user_confirmed", "rejected");
    private static final BigDecimal MIN_CORROBORATION_CONFIDENCE = new BigDecimal("0.50");

    private final ClaimRepository claimRepository;
    private final ClaimEvidenceLinkRepository linkRepository;
    private final EvidenceRepository evidenceRepository;
    private final VerificationSignalPolicy signalPolicy;

    @Override
    public void reconcileClaims(UUID profileId, Collection<UUID> claimIds) {
        if (profileId == null || claimIds == null || claimIds.isEmpty()) {
            return;
        }
        List<Claim> claims = claimRepository.findAllById(claimIds).stream()
                .filter(claim -> claim.getProfile() != null && profileId.equals(claim.getProfile().getId()))
                .toList();
        reconcile(profileId, claims);
    }

    @Override
    public void reconcileProfile(UUID profileId) {
        reconcile(profileId, claimRepository.findSkillClaimsByProfileId(profileId));
    }

    private void reconcile(UUID profileId, List<Claim> claims) {
        List<UUID> claimIds = claims.stream().map(Claim::getId).toList();
        List<ClaimEvidenceLink> links = claimIds.isEmpty()
                ? List.of()
                : linkRepository.findByProfileIdAndClaimIdIn(profileId, claimIds);
        Map<UUID, Evidence> evidenceById = evidenceRepository.findAllById(
                        links.stream().map(ClaimEvidenceLink::getEvidenceId).distinct().toList())
                .stream().collect(Collectors.toMap(Evidence::getId, Function.identity()));
        Map<UUID, List<ClaimEvidenceLink>> linksByClaim = links.stream()
                .collect(Collectors.groupingBy(ClaimEvidenceLink::getClaimId));

        OffsetDateTime now = OffsetDateTime.now();
        int changed = 0;
        for (Claim claim : claims) {
            String next = deriveStatus(claim, linksByClaim.getOrDefault(claim.getId(), List.of()), evidenceById);
            if (!Objects.equals(claim.getStatus(), next)) {
                long scoringLinks = linksByClaim.getOrDefault(claim.getId(), List.of()).stream()
                        .filter(link -> signalPolicy.isScoringEligibleLinkType(link.getLinkType()))
                        .count();
                log.info("Claim verification status changed profileId={} claimId={} prior={} next={} scoringLinks={}",
                        profileId, claim.getId(), claim.getStatus(), next,
                        scoringLinks);
                claim.setStatus(next);
                claim.setUpdatedAt(now);
                changed++;
            }
        }
        if (changed > 0) {
            claimRepository.saveAll(claims);
        }
    }

    private String deriveStatus(
            Claim claim,
            List<ClaimEvidenceLink> links,
            Map<UUID, Evidence> evidenceById
    ) {
        if (MANUAL_STATES.contains(normalize(claim.getStatus()))) {
            return normalize(claim.getStatus());
        }
        if (claim.getCanonicalSkillId() == null) {
            return "pending";
        }
        boolean verified = links.stream().anyMatch(link -> {
            Evidence evidence = evidenceById.get(link.getEvidenceId());
            BigDecimal reviewDepth = link.getEvidenceDepth() == null
                    ? link.getLinkConfidence()
                    : link.getEvidenceDepth();
            return evidence != null && signalPolicy.isEligibleForReviewedStatus(
                    evidence.getProvider(), link.getLinkType(), reviewDepth);
        });
        if (verified) {
            return "verified";
        }
        boolean corroborated = links.stream().anyMatch(link ->
                signalPolicy.isScoringEligibleLinkType(link.getLinkType())
                        && link.getLinkConfidence() != null
                        && link.getLinkConfidence().compareTo(MIN_CORROBORATION_CONFIDENCE) >= 0);
        return corroborated ? "corroborated" : "needs_evidence";
    }

    private String normalize(String value) {
        return value == null ? "pending" : value.trim().toLowerCase();
    }
}
