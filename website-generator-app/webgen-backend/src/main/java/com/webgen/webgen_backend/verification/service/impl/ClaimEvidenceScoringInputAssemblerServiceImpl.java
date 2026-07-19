package com.webgen.webgen_backend.verification.service.impl;

import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceScoringInputAssemblerService;
import com.webgen.webgen_backend.verification.service.scoring.EvidenceLinkSignalFactory;
import com.webgen.webgen_backend.verification.service.scoring.IndependentEvidenceSelector;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ClaimEvidenceScoringInputAssemblerServiceImpl
        implements ClaimEvidenceScoringInputAssemblerService {

    /**
     * Per-claim link cap to prevent score inflation from provider spam and keep
     * evidence influence bounded.
     */
    private static final int TOP_K_PER_CLAIM = 10;

    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final EvidenceRepository evidenceRepository;
    private final EvidenceLinkSignalFactory evidenceLinkSignalFactory;
    private final IndependentEvidenceSelector independentEvidenceSelector;

    @Autowired
    public ClaimEvidenceScoringInputAssemblerServiceImpl(
            ClaimEvidenceLinkRepository claimEvidenceLinkRepository,
            EvidenceRepository evidenceRepository,
            EvidenceLinkSignalFactory evidenceLinkSignalFactory,
            IndependentEvidenceSelector independentEvidenceSelector
    ) {
        this.claimEvidenceLinkRepository = claimEvidenceLinkRepository;
        this.evidenceRepository = evidenceRepository;
        this.evidenceLinkSignalFactory = evidenceLinkSignalFactory;
        this.independentEvidenceSelector = independentEvidenceSelector;
    }

    /** Preserves the existing explicit-construction contract used by test harnesses. */
    public ClaimEvidenceScoringInputAssemblerServiceImpl(
            ClaimEvidenceLinkRepository claimEvidenceLinkRepository,
            EvidenceRepository evidenceRepository,
            VerificationSignalPolicy verificationSignalPolicy,
            IndependentEvidenceSelector independentEvidenceSelector
    ) {
        this(
                claimEvidenceLinkRepository,
                evidenceRepository,
                new EvidenceLinkSignalFactory(verificationSignalPolicy),
                independentEvidenceSelector);
    }

    @Override
    public List<SkillClaimInput> assembleSkillClaimInputs(
            UUID profileId,
            List<Claim> skillClaims,
            Map<UUID, Skill> canonicalSkillsById,
            OffsetDateTime asOf
    ) {
        if (profileId == null || skillClaims == null || skillClaims.isEmpty()) {
            return List.of();
        }

        Map<UUID, Skill> canonicalById = canonicalSkillsById == null
                ? Map.of()
                : canonicalSkillsById;
        OffsetDateTime evaluationTime = asOf == null ? OffsetDateTime.now() : asOf;

        List<UUID> claimIds = skillClaims.stream()
                .map(Claim::getId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (claimIds.isEmpty()) {
            return skillClaims.stream()
                    .map(claim -> toInput(claim, canonicalById.get(claim.getCanonicalSkillId()), List.of()))
                    .toList();
        }

        List<ClaimEvidenceLink> links = claimEvidenceLinkRepository
                .findByProfileIdAndClaimIdIn(profileId, claimIds);
        if (links.isEmpty()) {
            return skillClaims.stream()
                    .map(claim -> toInput(claim, canonicalById.get(claim.getCanonicalSkillId()), List.of()))
                    .toList();
        }

        Map<UUID, List<ClaimEvidenceLink>> linksByClaimId = links.stream()
                .collect(Collectors.groupingBy(ClaimEvidenceLink::getClaimId));
        Map<UUID, Evidence> evidenceById = loadEvidenceById(profileId, links);

        return skillClaims.stream()
                .map(claim -> {
                    List<EvidenceLinkSignal> rankedSignals = linksByClaimId
                            .getOrDefault(claim.getId(), List.of())
                            .stream()
                            .map(link -> evidenceLinkSignalFactory.create(
                                    claim, link, evidenceById.get(link.getEvidenceId()), evaluationTime))
                            .filter(Objects::nonNull)
                            .sorted(this::compareSignals)
                            .toList();
                    List<EvidenceLinkSignal> evidenceSignals = independentEvidenceSelector.select(
                            claim.getId(), rankedSignals, TOP_K_PER_CLAIM);

                    return toInput(
                            claim,
                            canonicalById.get(claim.getCanonicalSkillId()),
                            evidenceSignals
                    );
                })
                .toList();
    }

    /**
     * Loads evidence rows referenced by links while enforcing profile ownership.
     */
    private Map<UUID, Evidence> loadEvidenceById(UUID profileId, List<ClaimEvidenceLink> links) {
        List<UUID> evidenceIds = links.stream()
                .map(ClaimEvidenceLink::getEvidenceId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (evidenceIds.isEmpty()) {
            return Map.of();
        }

        return evidenceRepository.findAllById(evidenceIds).stream()
                .filter(evidence -> evidence.getProfile() != null
                        && profileId.equals(evidence.getProfile().getId()))
                .collect(Collectors.toMap(Evidence::getId, Function.identity()));
    }

    // Sorts by decayed strength DESC, capturedAt DESC, evidenceId ASC.
    private int compareSignals(EvidenceLinkSignal left, EvidenceLinkSignal right) {
        int byStrength = right.decayedStrength().compareTo(left.decayedStrength());
        if (byStrength != 0) {
            return byStrength;
        }

        int byCapturedAt = compareOffsetDateTimeDesc(left.capturedAt(), right.capturedAt());
        if (byCapturedAt != 0) {
            return byCapturedAt;
        }

        return compareUuidAsc(left.evidenceId(), right.evidenceId());
    }

    // Null-safe descending timestamp comparator.
    private int compareOffsetDateTimeDesc(OffsetDateTime left, OffsetDateTime right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return right.compareTo(left);
    }

    // Null-safe ascending UUID comparator.
    private int compareUuidAsc(UUID left, UUID right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return left.compareTo(right);
    }

    /**
     * Maps persistence claim + optional canonical metadata + assembled evidence
     * into kernel input row.
     */
    private SkillClaimInput toInput(
            Claim claim,
            Skill skill,
            List<EvidenceLinkSignal> evidenceLinks
    ) {
        return new SkillClaimInput(
                claim.getId(),
                claim.getRawValue(),
                claim.getCanonicalSkillId(),
                skill != null ? skill.getName() : null,
                claim.getSource(),
                claim.getStatus(),
                skill != null ? skill.getCategory() : null,
                skill != null ? skill.getWeight() : null,
                evidenceLinks == null ? List.of() : evidenceLinks
        );
    }
}
