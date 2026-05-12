package com.webgen.webgen_backend.verification.service.impl;

import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceScoringInputAssemblerService;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import com.webgen.webgen_backend.verification.service.scoring.model.SkillClaimInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimEvidenceScoringInputAssemblerServiceImpl
        implements ClaimEvidenceScoringInputAssemblerService {

    /**
     * Per-claim link cap to prevent score inflation from provider spam and keep
     * evidence influence bounded.
     */
    private static final int TOP_K_PER_CLAIM = 10;

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE = BigDecimal.ONE;

    /**
     * Exponential-decay coefficient (lambda) used by:
     *
     *
     * recencyDecay(ageDays) = exp(-lambda * ageDays)
     *
     *
     * Decision rationale:
     * - lambda=0.00095 yields a half-life close to 730 days (2 years) because
     *   lambda ~= ln(2)/halfLifeDays.
     * - A 2-year half-life reflects that skills remain relevant beyond 9 months:
     *   a project from 1 year ago is still at ~71% strength, and 2 years at ~50%.
     * - Previous lambda=0.00257 (270-day half-life) decayed 1-year-old evidence to
     *   39%, which undervalued genuinely recent skill use.
     */
    private static final BigDecimal RECENCY_DECAY_LAMBDA = new BigDecimal("0.00095");

    /**
     * Unknown link types receive a conservative neutral-ish weight. This avoids
     * over-crediting unexpected classifier values while still allowing some
     * contribution.
     */
    private static final BigDecimal DEFAULT_LINK_TYPE_WEIGHT = new BigDecimal("0.50");

    /**
     * Deterministic trust priors per link classifier.
     *
     * Decision rationale:
     * - Dependency-level matches are strongest implementation signal.
     * - Topic/name/description progressively weaken from explicit to implicit text.
     * - Language-assisted links stay weakest to avoid language-only inflation.
     */
    private static final Map<String, BigDecimal> LINK_TYPE_WEIGHTS = Map.of(
            "dependency_match", new BigDecimal("1.00"),
            "topic_match", new BigDecimal("0.85"),
            "name_match", new BigDecimal("0.72"),
            "description_match", new BigDecimal("0.58"),
            "language_plus_text_match", new BigDecimal("0.48")
    );

    /**
     * Fixed scales keep floating-point transforms stable and auditable when
     * serialized/logged.
     */
    private static final int DECAY_SCALE = 8;
    private static final int SIGNAL_SCALE = 8;

    private final ClaimEvidenceLinkRepository claimEvidenceLinkRepository;
    private final EvidenceRepository evidenceRepository;

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
                    List<EvidenceLinkSignal> evidenceSignals = linksByClaimId
                            .getOrDefault(claim.getId(), List.of())
                            .stream()
                            .map(link -> toEvidenceSignal(claim, link, evidenceById.get(link.getEvidenceId()), evaluationTime))
                            .filter(Objects::nonNull)
                            .sorted(this::compareSignals)
                            .limit(TOP_K_PER_CLAIM)
                            .toList();

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

    /**
     * Converts one persisted claim-evidence link into normalized scoring signal.
     */
    private EvidenceLinkSignal toEvidenceSignal(
            Claim claim,
            ClaimEvidenceLink link,
            Evidence evidence,
            OffsetDateTime asOf
    ) {
        if (link == null || evidence == null) {
            return null;
        }

        String normalizedLinkType = normalizeLinkType(link.getLinkType());
        BigDecimal linkTypeWeight = LINK_TYPE_WEIGHTS.getOrDefault(
                normalizedLinkType,
                DEFAULT_LINK_TYPE_WEIGHT
        );
        BigDecimal boundedConfidence = clamp01(link.getLinkConfidence());

        OffsetDateTime signalTimestamp = resolveSignalTimestamp(evidence);
        int ageDays = resolveAgeDays(signalTimestamp, asOf);
        BigDecimal recencyDecay = computeRecencyDecay(ageDays);

        /*
         * Deterministic per-link strength formula:
         *
         * decayedStrength =
         *     boundedConfidence
         *   * linkTypeWeight
         *   * recencyDecay(ageDays)
         *
         * Interpretation:
         * - confidence reflects matcher certainty in [0,1]
         * - linkTypeWeight encodes signal quality prior
         * - recencyDecay discounts stale evidence continuously over time
         */
        BigDecimal decayedStrength = boundedConfidence
                .multiply(linkTypeWeight)
                .multiply(recencyDecay)
                .setScale(SIGNAL_SCALE, RoundingMode.HALF_UP);

        if (ageDays >= 180 || "name_match".equals(normalizedLinkType)) {
            String signalTimestampSource = resolveSignalTimestampSource(evidence);
            System.out.println(String.format(
                    "[EvidenceInput] claimId=%s rawValue=%s evidenceId=%s externalId=%s linkType=%s confidence=%s "
                            + "signalTimestampSource=%s occurredAt=%s capturedAt=%s asOf=%s ageDays=%d recencyDecay=%s decayedStrength=%s",
                    claim == null ? null : claim.getId(),
                    claim == null ? null : claim.getRawValue(),
                    evidence.getId(),
                    evidence.getExternalId(),
                    normalizedLinkType,
                    boundedConfidence,
                    signalTimestampSource,
                    evidence.getOccurredAt(),
                    evidence.getCapturedAt(),
                    asOf,
                    ageDays,
                    recencyDecay,
                    decayedStrength
            ));
        }

        return new EvidenceLinkSignal(
                evidence.getId(),
                normalizedLinkType,
                boundedConfidence,
                linkTypeWeight,
                evidence.getOccurredAt(),
                evidence.getCapturedAt(),
                ageDays,
                recencyDecay,
                decayedStrength,
                link.getReason(),
                evidence.getTitle(),
                evidence.getSourceUrl(),
                evidence.getProvider()
        );
    }

    // Prefer event time when available; fallback to ingestion time for recency.
    private OffsetDateTime resolveSignalTimestamp(Evidence evidence) {
        if (evidence == null) {
            return null;
        }
        return evidence.getOccurredAt() != null
                ? evidence.getOccurredAt()
                : evidence.getCapturedAt();
    }

    // Logs which timestamp field was selected as recency signal origin.
    private String resolveSignalTimestampSource(Evidence evidence) {
        if (evidence == null) {
            return "none";
        }
        if (evidence.getOccurredAt() != null) {
            return "occurredAt";
        }
        if (evidence.getCapturedAt() != null) {
            return "capturedAt";
        }
        return "none";
    }

    // Calculates non-negative integer age in days from signal timestamp to scoring time.
    private int resolveAgeDays(OffsetDateTime signalTimestamp, OffsetDateTime asOf) {
        if (signalTimestamp == null || asOf == null) {
            return 0;
        }

        long ageDays = Duration.between(signalTimestamp, asOf).toDays();
        if (ageDays <= 0) {
            return 0;
        }
        if (ageDays > Integer.MAX_VALUE) {
            return Integer.MAX_VALUE;
        }
        return (int) ageDays;
    }

    /**
     * Computes exponential recency multiplier:
     *
     *
     * recencyDecay(ageDays) = exp(-lambda * ageDays)
     *
     *
     * Mathematical behavior:
     * - ageDays = 0 -> decay = 1.0 (no penalty for fresh evidence)
     * - ageDays grows -> decay approaches 0 asymptotically
     * - decay is strictly monotonic and smooth, avoiding step-function cliffs
     */
    private BigDecimal computeRecencyDecay(int ageDays) {
        double exponent = RECENCY_DECAY_LAMBDA.negate().doubleValue() * ageDays;
        double rawDecay = Math.exp(exponent);
        return BigDecimal.valueOf(rawDecay).setScale(DECAY_SCALE, RoundingMode.HALF_UP);
    }

    // Lowercases + trims link type for stable weight lookup.
    private String normalizeLinkType(String linkType) {
        if (linkType == null || linkType.isBlank()) {
            return "unknown";
        }
        return linkType.trim().toLowerCase(Locale.ROOT);
    }

    // Bounds matcher confidence to [0,1] to protect scoring math.
    private BigDecimal clamp01(BigDecimal value) {
        if (value == null) {
            return ZERO;
        }
        if (value.compareTo(ZERO) < 0) {
            return ZERO;
        }
        if (value.compareTo(ONE) > 0) {
            return ONE;
        }
        return value;
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
