package com.webgen.webgen_backend.verification.service.scoring;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Locale;

/** Converts persisted claim evidence into a normalized, traceable scoring signal. */
@Slf4j
@Component
@RequiredArgsConstructor
public class EvidenceLinkSignalFactory {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE = BigDecimal.ONE;
    // A 0.00095 coefficient gives current evidence a gradual two-year half-life.
    private static final BigDecimal RECENCY_DECAY_LAMBDA = new BigDecimal("0.00095");
    private static final int DECAY_SCALE = 8;
    private static final int SIGNAL_SCALE = 8;

    private final VerificationSignalPolicy verificationSignalPolicy;

    /** Returns null when the persisted link is invalid or discovery-only. */
    public EvidenceLinkSignal create(
            Claim claim,
            ClaimEvidenceLink link,
            Evidence evidence,
            OffsetDateTime asOf
    ) {
        if (link == null || evidence == null) {
            return null;
        }

        String linkType = normalizeLinkType(link.getLinkType());
        if (!verificationSignalPolicy.isScoringEligibleLinkType(linkType)) {
            log.debug("[EvidenceInput][DiscoveryOnly] claimId={} evidenceId={} linkType={} "
                            + "excludedFromScoring=true",
                    claim == null ? null : claim.getId(), evidence.getId(), linkType);
            return null;
        }

        BigDecimal matchConfidence = clamp01(link.getLinkConfidence());
        BigDecimal evidenceDepth = link.getEvidenceDepth() == null
                ? matchConfidence
                : clamp01(link.getEvidenceDepth());
        BigDecimal linkTypeWeight = verificationSignalPolicy.linkTypeWeight(linkType);
        BigDecimal authorshipWeight = resolveMetadataWeight(evidence, "authorship");
        BigDecimal independenceWeight = resolveMetadataWeight(
                evidence, "repositoryIndependence");
        OffsetDateTime signalTimestamp = resolveSignalTimestamp(evidence);
        int ageDays = resolveAgeDays(signalTimestamp, asOf);
        BigDecimal recencyDecay = computeRecencyDecay(ageDays);

        BigDecimal decayedStrength = evidenceDepth
                .multiply(linkTypeWeight)
                .multiply(authorshipWeight)
                .multiply(independenceWeight)
                .multiply(recencyDecay)
                .setScale(SIGNAL_SCALE, RoundingMode.HALF_UP);

        log.debug("[EvidenceInput] claimId={} rawValue={} evidenceId={} externalId={} linkType={} "
                        + "matchConfidence={} evidenceDepth={} signalWeight={} authorshipWeight={} "
                        + "independenceWeight={} recencyDecay={} ageDays={} decayedStrength={}",
                claim == null ? null : claim.getId(),
                claim == null ? null : claim.getRawValue(),
                evidence.getId(),
                evidence.getExternalId(),
                linkType,
                matchConfidence,
                evidenceDepth,
                linkTypeWeight,
                authorshipWeight,
                independenceWeight,
                recencyDecay,
                ageDays,
                decayedStrength);

        return new EvidenceLinkSignal(
                evidence.getId(),
                linkType,
                matchConfidence,
                evidenceDepth,
                linkTypeWeight,
                evidence.getOccurredAt(),
                evidence.getCapturedAt(),
                ageDays,
                recencyDecay,
                decayedStrength,
                link.getReason(),
                evidence.getTitle(),
                evidence.getSourceUrl(),
                evidence.getProvider(),
                resolveEvidenceGroupKey(evidence));
    }

    private BigDecimal resolveMetadataWeight(Evidence evidence, String metadataSection) {
        if (!"github".equalsIgnoreCase(evidence.getProvider())
                || !"repository".equalsIgnoreCase(evidence.getEvidenceType())
                || evidence.getMetadata() == null) {
            return ONE;
        }
        JsonNode weight = evidence.getMetadata().path(metadataSection).path("weight");
        return weight.isNumber() ? clamp01(weight.decimalValue()) : ONE;
    }

    private String resolveEvidenceGroupKey(Evidence evidence) {
        if (evidence.getEvidenceGroupKey() != null && !evidence.getEvidenceGroupKey().isBlank()) {
            return evidence.getEvidenceGroupKey();
        }
        return evidence.getProvider() + ':' + evidence.getExternalId();
    }

    private OffsetDateTime resolveSignalTimestamp(Evidence evidence) {
        return evidence.getOccurredAt() != null
                ? evidence.getOccurredAt()
                : evidence.getCapturedAt();
    }

    private int resolveAgeDays(OffsetDateTime signalTimestamp, OffsetDateTime asOf) {
        if (signalTimestamp == null || asOf == null) {
            return 0;
        }
        long ageDays = Duration.between(signalTimestamp, asOf).toDays();
        if (ageDays <= 0) {
            return 0;
        }
        return ageDays > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) ageDays;
    }

    private BigDecimal computeRecencyDecay(int ageDays) {
        double exponent = RECENCY_DECAY_LAMBDA.negate().doubleValue() * ageDays;
        return BigDecimal.valueOf(Math.exp(exponent))
                .setScale(DECAY_SCALE, RoundingMode.HALF_UP);
    }

    private String normalizeLinkType(String linkType) {
        if (linkType == null || linkType.isBlank()) {
            return "unknown";
        }
        return linkType.trim().toLowerCase(Locale.ROOT);
    }

    private BigDecimal clamp01(BigDecimal value) {
        if (value == null || value.compareTo(ZERO) < 0) {
            return ZERO;
        }
        return value.compareTo(ONE) > 0 ? ONE : value;
    }
}
