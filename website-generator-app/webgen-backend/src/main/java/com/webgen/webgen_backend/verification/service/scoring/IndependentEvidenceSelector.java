package com.webgen.webgen_backend.verification.service.scoring;

import com.webgen.webgen_backend.verification.service.scoring.model.EvidenceLinkSignal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Selects one strongest signal per correlated evidence group. */
@Slf4j
@Component
public class IndependentEvidenceSelector {

    /**
     * Keeps the first signal from each group. Callers must provide strongest-first
     * input so the retained signal is deterministic and maximizes scoring value.
     */
    public List<EvidenceLinkSignal> select(
            UUID claimId,
            List<EvidenceLinkSignal> rankedSignals,
            int limit
    ) {
        if (rankedSignals == null || rankedSignals.isEmpty() || limit <= 0) {
            return List.of();
        }

        Map<String, EvidenceLinkSignal> strongestByGroup = new LinkedHashMap<>();
        for (EvidenceLinkSignal signal : rankedSignals) {
            String groupKey = resolveGroupKey(signal);
            EvidenceLinkSignal retained = strongestByGroup.putIfAbsent(groupKey, signal);
            if (retained != null) {
                log.debug("[EvidenceIndependence] claimId={} groupKey={} retainedEvidenceId={} "
                                + "retainedStrength={} discardedEvidenceId={} discardedStrength={}",
                        claimId, groupKey, retained.evidenceId(), retained.decayedStrength(),
                        signal.evidenceId(), signal.decayedStrength());
            }
        }

        List<EvidenceLinkSignal> selected = strongestByGroup.values().stream()
                .limit(limit)
                .toList();
        log.debug("[EvidenceIndependence] claimId={} rawSignals={} independentGroups={} "
                        + "duplicatesRemoved={} topK={} selectedSignals={}",
                claimId, rankedSignals.size(), strongestByGroup.size(),
                rankedSignals.size() - strongestByGroup.size(), limit, selected.size());
        return selected;
    }

    private String resolveGroupKey(EvidenceLinkSignal signal) {
        if (signal.evidenceGroupKey() != null && !signal.evidenceGroupKey().isBlank()) {
            return signal.evidenceGroupKey();
        }
        String provider = signal.provider() == null ? "unknown" : signal.provider();
        return provider + ":evidence:" + signal.evidenceId();
    }
}
