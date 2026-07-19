package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactFingerprintSimilarity;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Assigns partial evidence credit to repositories derived from a stronger primary. */
@Slf4j
@Component
@RequiredArgsConstructor
public class GithubDerivativeCreditAssigner {

    private static final int ESTIMATE_SCALE = 4;
    private final ArtifactFingerprintSimilarity fingerprintSimilarity;
    private final GithubRepositoryNoveltyPolicy noveltyPolicy;

    /** Adds a persisted independence multiplier without changing repository identity. */
    public List<EvidenceCandidate> assign(
            List<EvidenceCandidate> candidates,
            Map<String, ArtifactSemanticFingerprint> fingerprintsByExternalId
    ) {
        if (candidates == null || candidates.isEmpty()
                || fingerprintsByExternalId == null || fingerprintsByExternalId.size() < 2) {
            return candidates == null ? List.of() : List.copyOf(candidates);
        }

        List<SourceGroup> sourceGroups = buildSourceGroups(candidates, fingerprintsByExternalId);
        if (sourceGroups.size() < 2) {
            return List.copyOf(candidates);
        }

        List<DerivativeFamily> families = buildPrimaryRelativeFamilies(sourceGroups);
        Map<String, IndependenceAssignment> assignments = buildAssignments(families);
        if (assignments.isEmpty()) {
            return List.copyOf(candidates);
        }
        return candidates.stream()
                .map(candidate -> applyAssignment(candidate, assignments.get(candidate.externalId())))
                .toList();
    }

    private List<SourceGroup> buildSourceGroups(
            List<EvidenceCandidate> candidates,
            Map<String, ArtifactSemanticFingerprint> fingerprints
    ) {
        Map<String, List<Member>> membersByGroup = new LinkedHashMap<>();
        for (EvidenceCandidate candidate : candidates) {
            ArtifactSemanticFingerprint fingerprint = fingerprints.get(candidate.externalId());
            if (fingerprint == null || !fingerprint.isComparable()) {
                continue;
            }
            membersByGroup.computeIfAbsent(candidate.evidenceGroupKey(), ignored -> new ArrayList<>())
                    .add(new Member(candidate, fingerprint));
        }
        return membersByGroup.entrySet().stream()
                .map(entry -> new SourceGroup(entry.getKey(), List.copyOf(entry.getValue())))
                .sorted(sourceGroupPriority())
                .toList();
    }

    private List<DerivativeFamily> buildPrimaryRelativeFamilies(List<SourceGroup> sourceGroups) {
        List<DerivativeFamily> families = new ArrayList<>();
        for (SourceGroup sourceGroup : sourceGroups) {
            DerivativeFamily relatedFamily = families.stream()
                    .filter(family -> family.isRelated(sourceGroup, fingerprintSimilarity))
                    .findFirst()
                    .orElse(null);
            if (relatedFamily == null) {
                families.add(new DerivativeFamily(sourceGroup));
            } else {
                relatedFamily.derivatives.add(sourceGroup);
            }
        }
        return families;
    }

    private Map<String, IndependenceAssignment> buildAssignments(
            List<DerivativeFamily> families
    ) {
        Map<String, IndependenceAssignment> assignments = new HashMap<>();
        for (DerivativeFamily family : families) {
            if (family.derivatives.isEmpty()) {
                continue;
            }
            putAssignment(assignments, family.primary, new IndependenceAssignment(
                    family.primary.groupKey,
                    "primary",
                    false,
                    estimate(0.0d),
                    estimate(1.0d),
                    BigDecimal.ONE));
            for (SourceGroup derivative : family.derivatives) {
                double sharedContent = family.similarityToPrimary(
                        derivative, fingerprintSimilarity);
                boolean sharedLineage = family.sharesLineageWith(derivative);
                BigDecimal sharedContentEstimate = estimate(sharedContent);
                BigDecimal novelContentEstimate = BigDecimal.ONE
                        .subtract(sharedContentEstimate)
                        .setScale(ESTIMATE_SCALE, RoundingMode.HALF_UP);
                BigDecimal contentWeight = noveltyPolicy.independenceWeight(sharedContent);
                BigDecimal weight = sharedLineage
                        ? noveltyPolicy.lineageIndependenceWeight(sharedContent)
                        : contentWeight;
                putAssignment(assignments, derivative, new IndependenceAssignment(
                        family.primary.groupKey,
                        sharedLineage ? "lineage_derivative" : "derivative",
                        sharedLineage,
                        sharedContentEstimate,
                        novelContentEstimate,
                        weight));
                log.info("github.derivative_credit primaryGroup={} derivativeGroup={} "
                                + "sharedLineage={} sharedContent={} novelContent={} "
                                + "contentWeight={} lineageCreditCap={} independenceWeight={}",
                        family.primary.groupKey,
                        derivative.groupKey,
                        sharedLineage,
                        sharedContentEstimate,
                        novelContentEstimate,
                        contentWeight,
                        GithubRepositoryNoveltyPolicy.MAXIMUM_LINEAGE_CREDIT,
                        weight);
            }
        }
        return assignments;
    }

    private void putAssignment(
            Map<String, IndependenceAssignment> assignments,
            SourceGroup sourceGroup,
            IndependenceAssignment assignment
    ) {
        sourceGroup.members.forEach(member ->
                assignments.put(member.candidate.externalId(), assignment));
    }

    private EvidenceCandidate applyAssignment(
            EvidenceCandidate candidate,
            IndependenceAssignment assignment
    ) {
        if (assignment == null || !(candidate.metadata() instanceof ObjectNode objectNode)) {
            return candidate;
        }
        ObjectNode metadata = objectNode.deepCopy();
        ObjectNode independence = metadata.putObject("repositoryIndependence");
        independence.put("algorithmVersion", 2);
        independence.put("classification", assignment.classification());
        independence.put("primaryGroupKey", assignment.primaryGroupKey());
        independence.put("sharedLineage", assignment.sharedLineage());
        independence.put("sharedContentEstimate", assignment.sharedContentEstimate());
        independence.put("novelContentEstimate", assignment.novelContentEstimate());
        independence.put("derivativeThreshold",
                GithubRepositoryNoveltyPolicy.DERIVATIVE_SIMILARITY_THRESHOLD);
        independence.put("duplicateThreshold",
                GithubRepositoryNoveltyPolicy.DUPLICATE_SIMILARITY_THRESHOLD);
        independence.put("minimumDerivativeCredit",
                GithubRepositoryNoveltyPolicy.MINIMUM_DERIVATIVE_CREDIT);
        independence.put("maximumLineageCredit",
                GithubRepositoryNoveltyPolicy.MAXIMUM_LINEAGE_CREDIT);
        independence.put("weight", assignment.weight());
        independence.put("effect", "evidence_strength_multiplier");
        return new EvidenceCandidate(
                candidate.externalId(), candidate.evidenceGroupKey(), candidate.evidenceType(),
                candidate.title(), candidate.description(), candidate.sourceUrl(),
                candidate.occurredAt(), candidate.capturedAt(), metadata);
    }

    private Comparator<SourceGroup> sourceGroupPriority() {
        return Comparator
                .comparingInt(SourceGroup::maximumTokenCount).reversed()
                .thenComparing(SourceGroup::maximumAuthorshipWeight, Comparator.reverseOrder())
                .thenComparing(SourceGroup::latestOccurrence,
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(SourceGroup::groupKey);
    }

    private BigDecimal estimate(double value) {
        return BigDecimal.valueOf(value).setScale(ESTIMATE_SCALE, RoundingMode.HALF_UP);
    }

    private record Member(
            EvidenceCandidate candidate,
            ArtifactSemanticFingerprint fingerprint
    ) {}

    private record SourceGroup(String groupKey, List<Member> members) {
        private int maximumTokenCount() {
            return members.stream().mapToInt(member -> member.fingerprint.tokenCount()).max().orElse(0);
        }

        private BigDecimal maximumAuthorshipWeight() {
            return members.stream()
                    .map(member -> authorshipWeight(member.candidate.metadata()))
                    .max(BigDecimal::compareTo)
                    .orElse(BigDecimal.ONE);
        }

        private OffsetDateTime latestOccurrence() {
            return members.stream()
                    .map(member -> member.candidate.occurredAt())
                    .filter(timestamp -> timestamp != null)
                    .max(OffsetDateTime::compareTo)
                    .orElse(null);
        }

        private boolean sharesLineageWith(SourceGroup other) {
            Set<Long> ownLineage = lineageRepositoryIds();
            return !ownLineage.isEmpty()
                    && other.lineageRepositoryIds().stream().anyMatch(ownLineage::contains);
        }

        private Set<Long> lineageRepositoryIds() {
            return members.stream()
                    .map(member -> GithubRepositoryLineageIdentity.resolve(
                            member.candidate.metadata()))
                    .filter(id -> id != null)
                    .collect(java.util.stream.Collectors.toUnmodifiableSet());
        }

        private static BigDecimal authorshipWeight(JsonNode metadata) {
            JsonNode weight = metadata == null ? null : metadata.path("authorship").path("weight");
            return weight != null && weight.isNumber() ? weight.decimalValue() : BigDecimal.ONE;
        }
    }

    private static final class DerivativeFamily {
        private final SourceGroup primary;
        private final List<SourceGroup> derivatives = new ArrayList<>();

        private DerivativeFamily(SourceGroup primary) {
            this.primary = primary;
        }

        private boolean isRelated(
                SourceGroup candidate,
                ArtifactFingerprintSimilarity similarity
        ) {
            return sharesLineageWith(candidate)
                    || similarityToPrimary(candidate, similarity)
                    >= GithubRepositoryNoveltyPolicy.DERIVATIVE_SIMILARITY_THRESHOLD;
        }

        private boolean sharesLineageWith(SourceGroup candidate) {
            return primary.sharesLineageWith(candidate);
        }

        private double similarityToPrimary(
                SourceGroup candidate,
                ArtifactFingerprintSimilarity similarity
        ) {
            double maximum = 0.0d;
            for (Member primaryMember : primary.members) {
                for (Member candidateMember : candidate.members) {
                    maximum = Math.max(maximum, similarity.compare(
                            primaryMember.fingerprint, candidateMember.fingerprint));
                }
            }
            return maximum;
        }
    }

    private record IndependenceAssignment(
            String primaryGroupKey,
            String classification,
            boolean sharedLineage,
            BigDecimal sharedContentEstimate,
            BigDecimal novelContentEstimate,
            BigDecimal weight
    ) {}
}
