package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

/** Builds production repository fingerprints from a bounded source-file sample. */
@Component
@RequiredArgsConstructor
@Slf4j
public class GithubRepositoryFingerprintBuilder {

    public static final int MAX_FILES = 8;
    public static final long MAX_TOTAL_BYTES = 600_000L;

    private final GithubRepositoryFilePolicy filePolicy;
    private final GithubRepositorySampleSelector sampleSelector;
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
        List<GithubTreeResponse.Entry> selected = sampleSelector.select(eligible);
        List<ArtifactSemanticFingerprintGenerator.SourceDocument> documents = new ArrayList<>();
        for (GithubTreeResponse.Entry entry : selected) {
            String content = contentLoader.apply(entry.path());
            if (content != null && !content.isBlank()) {
                documents.add(new ArtifactSemanticFingerprintGenerator.SourceDocument(
                        entry.path(), content));
            }
        }
        log.info("github.fingerprint_sample eligibleFiles={} selectedFiles={} "
                        + "selectedSourceAreas={} selectedBytes={} paths={}",
                eligible.size(),
                selected.size(),
                selected.stream().map(entry -> sampleSelector.sourceArea(entry.path()))
                        .distinct().count(),
                selected.stream().mapToLong(this::sizeOrZero).sum(),
                selected.stream().map(GithubTreeResponse.Entry::path).toList());
        return fingerprintGenerator.generate(eligible.size(), documents).orElse(null);
    }

    private long sizeOrZero(GithubTreeResponse.Entry entry) {
        return entry.size() == null ? 0L : entry.size();
    }
}
