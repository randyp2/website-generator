package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactFingerprintSimilarity;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Conservatively collapses repositories with highly overlapping sampled source. */
@Slf4j
@Component
@RequiredArgsConstructor
public class GithubSemanticEvidenceGrouper {

    public static final double SIMILARITY_THRESHOLD = 0.90d;
    private final ArtifactFingerprintSimilarity fingerprintSimilarity;

    /** Returns candidates with a shared group key only for complete-link matches. */
    public List<EvidenceCandidate> group(
            List<EvidenceCandidate> candidates,
            Map<String, ArtifactSemanticFingerprint> fingerprintsByExternalId
    ) {
        if (candidates == null || candidates.isEmpty()
                || fingerprintsByExternalId == null || fingerprintsByExternalId.size() < 2) {
            return candidates == null ? List.of() : List.copyOf(candidates);
        }

        List<EvidenceCandidate> comparable = candidates.stream()
                .filter(candidate -> fingerprintsByExternalId.containsKey(candidate.externalId()))
                .sorted(Comparator.comparing(EvidenceCandidate::externalId))
                .toList();
        List<Cluster> clusters = buildClusters(comparable, fingerprintsByExternalId);
        Map<String, GroupAssignment> assignments = buildAssignments(clusters);
        if (assignments.isEmpty()) {
            return List.copyOf(candidates);
        }

        return candidates.stream()
                .map(candidate -> applyAssignment(candidate, assignments.get(candidate.externalId())))
                .toList();
    }

    private List<Cluster> buildClusters(
            List<EvidenceCandidate> candidates,
            Map<String, ArtifactSemanticFingerprint> fingerprints
    ) {
        List<Cluster> clusters = new ArrayList<>();
        for (EvidenceCandidate candidate : candidates) {
            ArtifactSemanticFingerprint fingerprint = fingerprints.get(candidate.externalId());
            Cluster sourceCluster = clusters.stream()
                    .filter(cluster -> cluster.containsSourceGroup(candidate.evidenceGroupKey()))
                    .findFirst()
                    .orElse(null);
            if (sourceCluster != null) {
                sourceCluster.add(candidate, fingerprint);
                continue;
            }

            Cluster semanticCluster = clusters.stream()
                    .filter(cluster -> cluster.matchesEverySourceGroup(
                            fingerprint, fingerprintSimilarity))
                    .findFirst()
                    .orElse(null);
            if (semanticCluster == null) {
                clusters.add(new Cluster(candidate, fingerprint));
            } else {
                semanticCluster.add(candidate, fingerprint);
            }
        }
        return clusters;
    }

    private Map<String, GroupAssignment> buildAssignments(List<Cluster> clusters) {
        Map<String, GroupAssignment> assignments = new HashMap<>();
        for (Cluster cluster : clusters) {
            if (!cluster.isSemanticDuplicate()) {
                continue;
            }
            ArtifactSemanticFingerprint representative = cluster.fingerprints.stream()
                    .min(Comparator.comparing(ArtifactSemanticFingerprint::exactContentHash))
                    .orElseThrow();
            String groupKey = "github:semantic:v" + representative.algorithmVersion() + ':'
                    + representative.exactContentHash().substring(0, 24);
            double minimumSimilarity = cluster.minimumSimilarity(fingerprintSimilarity);
            GroupAssignment assignment = new GroupAssignment(
                    groupKey,
                    representative.algorithmVersion(),
                    cluster.members.size(),
                    minimumSimilarity);
            cluster.members.forEach(member -> assignments.put(member.externalId(), assignment));
            log.info("github.semantic_group groupKey={} members={} threshold={} minimumSimilarity={}",
                    groupKey,
                    cluster.members.stream().map(EvidenceCandidate::externalId).toList(),
                    SIMILARITY_THRESHOLD,
                    minimumSimilarity);
        }
        return assignments;
    }

    private EvidenceCandidate applyAssignment(
            EvidenceCandidate candidate,
            GroupAssignment assignment
    ) {
        if (assignment == null) {
            return candidate;
        }
        ObjectNode metadata = candidate.metadata() instanceof ObjectNode objectNode
                ? objectNode.deepCopy()
                : null;
        if (metadata != null) {
            ObjectNode group = metadata.putObject("semanticSimilarityGroup");
            group.put("algorithmVersion", assignment.algorithmVersion());
            group.put("groupKey", assignment.groupKey());
            group.put("memberCount", assignment.memberCount());
            group.put("similarityThreshold", SIMILARITY_THRESHOLD);
            group.put("minimumSimilarity", assignment.minimumSimilarity());
            group.put("effect", "strongest_evidence_only");
        }
        return new EvidenceCandidate(
                candidate.externalId(),
                assignment.groupKey(),
                candidate.evidenceType(),
                candidate.title(),
                candidate.description(),
                candidate.sourceUrl(),
                candidate.occurredAt(),
                candidate.capturedAt(),
                metadata == null ? candidate.metadata() : metadata);
    }

    private static final class Cluster {
        private final List<EvidenceCandidate> members = new ArrayList<>();
        private final List<ArtifactSemanticFingerprint> fingerprints = new ArrayList<>();
        private final Set<String> sourceGroupKeys = new LinkedHashSet<>();

        private Cluster(EvidenceCandidate candidate, ArtifactSemanticFingerprint fingerprint) {
            add(candidate, fingerprint);
        }

        private void add(EvidenceCandidate candidate, ArtifactSemanticFingerprint fingerprint) {
            members.add(candidate);
            fingerprints.add(fingerprint);
            sourceGroupKeys.add(candidate.evidenceGroupKey());
        }

        private boolean containsSourceGroup(String groupKey) {
            return sourceGroupKeys.contains(groupKey);
        }

        private boolean matchesEverySourceGroup(
                ArtifactSemanticFingerprint candidate,
                ArtifactFingerprintSimilarity similarity
        ) {
            if (candidate == null || !candidate.isComparable()) {
                return false;
            }
            for (String sourceGroupKey : sourceGroupKeys) {
                boolean matchesSource = false;
                for (int index = 0; index < members.size(); index++) {
                    if (sourceGroupKey.equals(members.get(index).evidenceGroupKey())
                            && similarity.compare(candidate, fingerprints.get(index))
                            >= SIMILARITY_THRESHOLD) {
                        matchesSource = true;
                        break;
                    }
                }
                if (!matchesSource) {
                    return false;
                }
            }
            return true;
        }

        private boolean isSemanticDuplicate() {
            return members.size() > 1 && sourceGroupKeys.size() > 1;
        }

        private double minimumSimilarity(ArtifactFingerprintSimilarity similarity) {
            double minimum = 1.0d;
            List<String> groups = List.copyOf(sourceGroupKeys);
            for (int first = 0; first < groups.size(); first++) {
                for (int second = first + 1; second < groups.size(); second++) {
                    minimum = Math.min(minimum,
                            maximumSimilarity(groups.get(first), groups.get(second), similarity));
                }
            }
            return minimum;
        }

        private double maximumSimilarity(
                String firstGroup,
                String secondGroup,
                ArtifactFingerprintSimilarity similarity
        ) {
            double maximum = 0.0d;
            for (int first = 0; first < members.size(); first++) {
                if (!firstGroup.equals(members.get(first).evidenceGroupKey())) {
                    continue;
                }
                for (int second = 0; second < members.size(); second++) {
                    if (secondGroup.equals(members.get(second).evidenceGroupKey())) {
                        maximum = Math.max(maximum,
                                similarity.compare(fingerprints.get(first), fingerprints.get(second)));
                    }
                }
            }
            return maximum;
        }
    }

    private record GroupAssignment(
            String groupKey,
            int algorithmVersion,
            int memberCount,
            double minimumSimilarity
    ) {}
}
