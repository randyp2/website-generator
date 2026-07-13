package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Selects a bounded, deterministic sample across repository source areas. */
@Component
public class GithubRepositorySampleSelector {

    private static final long TARGET_BYTES_PER_AREA =
            GithubRepositoryFingerprintBuilder.MAX_TOTAL_BYTES
                    / GithubRepositoryFingerprintBuilder.MAX_FILES;

    /** Balances the first pass across source areas, then fills unused capacity. */
    public List<GithubTreeResponse.Entry> select(
            List<GithubTreeResponse.Entry> eligible
    ) {
        if (eligible == null || eligible.isEmpty()) {
            return List.of();
        }

        Selection selection = new Selection();
        sourceAreas(eligible).forEach(area -> selection.add(representative(area)));

        eligible.stream()
                .sorted(filePriority())
                .forEach(selection::add);
        return selection.entries();
    }

    /** Returns the stable two-level directory bucket used for sample diversity. */
    public String sourceArea(String path) {
        if (path == null || path.isBlank()) {
            return ".";
        }
        String[] segments = path.replace('\\', '/').split("/");
        int directoryCount = Math.max(0, segments.length - 1);
        if (directoryCount == 0 || segments[0].startsWith(".")) {
            return ".";
        }
        return directoryCount == 1
                ? segments[0]
                : segments[0] + '/' + segments[1];
    }

    private List<List<GithubTreeResponse.Entry>> sourceAreas(
            List<GithubTreeResponse.Entry> eligible
    ) {
        Map<String, List<GithubTreeResponse.Entry>> entriesByArea = new LinkedHashMap<>();
        eligible.forEach(entry -> entriesByArea
                .computeIfAbsent(sourceArea(entry.path()), ignored -> new ArrayList<>())
                .add(entry));
        return entriesByArea.entrySet().stream()
                .sorted(Comparator
                        .<Map.Entry<String, List<GithubTreeResponse.Entry>>>comparingLong(
                                entry -> totalBytes(entry.getValue()))
                        .reversed()
                        .thenComparing(Map.Entry::getKey))
                .limit(GithubRepositoryFingerprintBuilder.MAX_FILES)
                .map(Map.Entry::getValue)
                .toList();
    }

    private GithubTreeResponse.Entry representative(
            List<GithubTreeResponse.Entry> area
    ) {
        return area.stream()
                .filter(entry -> size(entry) <= TARGET_BYTES_PER_AREA)
                .min(filePriority())
                .orElseGet(() -> area.stream()
                        .min(Comparator.comparingLong(this::size)
                                .thenComparing(GithubTreeResponse.Entry::path))
                        .orElseThrow());
    }

    private Comparator<GithubTreeResponse.Entry> filePriority() {
        return Comparator.comparingLong(this::size)
                .reversed()
                .thenComparing(GithubTreeResponse.Entry::path);
    }

    private long totalBytes(List<GithubTreeResponse.Entry> entries) {
        return entries.stream().mapToLong(this::size).sum();
    }

    private long size(GithubTreeResponse.Entry entry) {
        return entry.size() == null ? 0L : entry.size();
    }

    private final class Selection {
        private final List<GithubTreeResponse.Entry> entries = new ArrayList<>();
        private final Set<String> paths = new HashSet<>();
        private final Set<String> blobIds = new HashSet<>();
        private long bytes;

        private void add(GithubTreeResponse.Entry entry) {
            if (entries.size() >= GithubRepositoryFingerprintBuilder.MAX_FILES
                    || paths.contains(entry.path())
                    || hasSelectedBlob(entry)) {
                return;
            }
            long entryBytes = size(entry);
            if (!entries.isEmpty()
                    && bytes + entryBytes > GithubRepositoryFingerprintBuilder.MAX_TOTAL_BYTES) {
                return;
            }
            entries.add(entry);
            paths.add(entry.path());
            if (entry.sha() != null && !entry.sha().isBlank()) {
                blobIds.add(entry.sha());
            }
            bytes += entryBytes;
        }

        private boolean hasSelectedBlob(GithubTreeResponse.Entry entry) {
            return entry.sha() != null
                    && !entry.sha().isBlank()
                    && blobIds.contains(entry.sha());
        }

        private List<GithubTreeResponse.Entry> entries() {
            return List.copyOf(entries);
        }
    }
}
