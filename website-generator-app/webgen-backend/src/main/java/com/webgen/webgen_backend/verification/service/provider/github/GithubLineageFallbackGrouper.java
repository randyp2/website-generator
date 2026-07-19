package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Preserves conservative lineage grouping when a family cannot be fully compared. */
@Slf4j
@Component
public class GithubLineageFallbackGrouper {

    /** Groups a lineage family when any of its repositories lacks a usable fingerprint. */
    public List<EvidenceCandidate> group(
            List<EvidenceCandidate> candidates,
            Map<String, ArtifactSemanticFingerprint> fingerprintsByExternalId
    ) {
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        Map<Long, List<EvidenceCandidate>> candidatesByLineage = new HashMap<>();
        candidates.forEach(candidate -> {
            Long lineageId = GithubRepositoryLineageIdentity.resolve(candidate.metadata());
            if (lineageId != null) {
                candidatesByLineage.computeIfAbsent(lineageId, ignored -> new ArrayList<>())
                        .add(candidate);
            }
        });

        Map<String, Long> fallbackLineageByExternalId = new HashMap<>();
        candidatesByLineage.forEach((lineageId, family) -> {
            if (family.size() > 1 && family.stream().anyMatch(candidate ->
                    !hasComparableFingerprint(candidate, fingerprintsByExternalId))) {
                family.forEach(candidate ->
                        fallbackLineageByExternalId.put(candidate.externalId(), lineageId));
                log.info("github.lineage_fallback rootRepositoryId={} members={} "
                                + "reason=incomplete_fingerprint_coverage",
                        lineageId,
                        family.stream().map(EvidenceCandidate::externalId).toList());
            }
        });

        if (fallbackLineageByExternalId.isEmpty()) {
            return List.copyOf(candidates);
        }
        return candidates.stream()
                .map(candidate -> applyFallback(
                        candidate, fallbackLineageByExternalId.get(candidate.externalId())))
                .toList();
    }

    private boolean hasComparableFingerprint(
            EvidenceCandidate candidate,
            Map<String, ArtifactSemanticFingerprint> fingerprints
    ) {
        ArtifactSemanticFingerprint fingerprint = fingerprints == null
                ? null
                : fingerprints.get(candidate.externalId());
        return fingerprint != null && fingerprint.isComparable();
    }

    private EvidenceCandidate applyFallback(EvidenceCandidate candidate, Long lineageId) {
        if (lineageId == null) {
            return candidate;
        }
        ObjectNode metadata = candidate.metadata() instanceof ObjectNode objectNode
                ? objectNode.deepCopy()
                : null;
        if (metadata != null) {
            ObjectNode fallback = metadata.putObject("lineageFallbackGroup");
            fallback.put("algorithmVersion", 1);
            fallback.put("rootRepositoryId", lineageId);
            fallback.put("reason", "incomplete_fingerprint_coverage");
            fallback.put("effect", "strongest_evidence_only");
        }
        return new EvidenceCandidate(
                candidate.externalId(),
                "github:repository:" + lineageId,
                candidate.evidenceType(),
                candidate.title(),
                candidate.description(),
                candidate.sourceUrl(),
                candidate.occurredAt(),
                candidate.capturedAt(),
                metadata == null ? candidate.metadata() : metadata);
    }
}
