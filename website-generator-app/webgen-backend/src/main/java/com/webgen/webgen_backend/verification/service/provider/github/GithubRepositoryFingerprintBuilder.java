package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

/** Builds production repository fingerprints from a bounded source-file sample. */
@Component
@RequiredArgsConstructor
public class GithubRepositoryFingerprintBuilder {

    public static final int MAX_FILES = 8;
    public static final long MAX_TOTAL_BYTES = 600_000L;

    private final GithubRepositoryFilePolicy filePolicy;
    private final ArtifactSemanticFingerprintGenerator fingerprintGenerator;

    /** Reads only selected paths through the supplied content loader. */
    public ArtifactSemanticFingerprint build(
            List<GithubTreeResponse.Entry> tree,
            Function<String, String> contentLoader
    ) {
        if (tree == null || tree.isEmpty() || contentLoader == null) {
            return null;
        }

        List<GithubTreeResponse.Entry> eligible = tree.stream()
                .filter(filePolicy::isEligible)
                .sorted(Comparator
                        .comparingLong(this::sizeOrZero)
                        .reversed()
                        .thenComparing(GithubTreeResponse.Entry::path))
                .toList();
        List<ArtifactSemanticFingerprintGenerator.SourceDocument> documents = new ArrayList<>();
        for (GithubTreeResponse.Entry entry : selectWithinBudget(eligible)) {
            String content = contentLoader.apply(entry.path());
            if (content != null && !content.isBlank()) {
                documents.add(new ArtifactSemanticFingerprintGenerator.SourceDocument(
                        entry.path(), content));
            }
        }
        return fingerprintGenerator.generate(eligible.size(), documents).orElse(null);
    }

    private List<GithubTreeResponse.Entry> selectWithinBudget(
            List<GithubTreeResponse.Entry> eligible
    ) {
        List<GithubTreeResponse.Entry> selected = new ArrayList<>();
        long selectedBytes = 0L;
        for (GithubTreeResponse.Entry entry : eligible) {
            long size = sizeOrZero(entry);
            if (selected.size() >= MAX_FILES) {
                break;
            }
            if (!selected.isEmpty() && selectedBytes + size > MAX_TOTAL_BYTES) {
                continue;
            }
            selected.add(entry);
            selectedBytes += size;
        }
        return List.copyOf(selected);
    }

    private long sizeOrZero(GithubTreeResponse.Entry entry) {
        return Optional.ofNullable(entry.size()).orElse(0L);
    }
}
