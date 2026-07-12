package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.ManifestDependencyParser;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepositoryScanResult;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

@Slf4j
@Component
@RequiredArgsConstructor
public class GithubRepositorySignalScanner {

    // Upper bound on manifests fetched per repo, so a large monorepo with many
    // manifests cannot trigger an unbounded number of content fetches.
    private static final int MAX_MANIFESTS_PER_REPO = 10;
    private static final int MAX_FINGERPRINT_FILES_PER_REPO = 8;
    private static final long MAX_FINGERPRINT_BYTES_PER_REPO = 600_000L;

    private final GithubApiClient githubApiClient;
    private final ManifestDependencyParser manifestDependencyParser;
    private final GithubRepositoryFilePolicy repositoryFilePolicy;
    private final ArtifactSemanticFingerprintGenerator fingerprintGenerator;

    /**
     * Scans a repository for dependency/build signals. Locates every parseable
     * manifest anywhere in the repo with a single Git Trees call, then fetches and
     * parses only those manifests. When enabled, it also fingerprints a bounded
     * source sample selected from the same tree response.
     */
    public GithubRepositoryScanResult scanRepository(
            String accessToken,
            String fullName,
            String defaultBranch,
            boolean includeFingerprint
    ) {
        String[] repoParts = splitRepoFullName(fullName);
        if (repoParts == null) {
            return GithubRepositoryScanResult.empty();
        }
        String owner = repoParts[0];
        String repo = repoParts[1];

        List<GithubTreeResponse.Entry> tree = githubApiClient
                .fetchRepositoryTreeEntries(accessToken, owner, repo, defaultBranch);
        List<String> manifestPaths = tree.stream()
                .map(GithubTreeResponse.Entry::path)
                .filter(path -> manifestDependencyParser.canParse(fileName(path)))
                .sorted()
                .limit(MAX_MANIFESTS_PER_REPO)
                .toList();

        Map<String, String> contentByPath = new LinkedHashMap<>();
        Map<String, String> sourcesByToken = new LinkedHashMap<>();
        for (String path : manifestPaths) {
            String content = fetchTextContent(
                    accessToken, owner, repo, defaultBranch, path, contentByPath);
            for (String token : manifestDependencyParser.parse(fileName(path), content)) {
                sourcesByToken.putIfAbsent(token, path);
            }
        }

        ArtifactSemanticFingerprint fingerprint = includeFingerprint
                ? buildFingerprint(accessToken, owner, repo, defaultBranch, tree, contentByPath)
                : null;
        log.info(
                "connection.sync.repo_scan fullName={} manifests={} signals={} "
                        + "fingerprintVersion={} eligibleFiles={} sampledFiles={} tokens={} shingles={}",
                fullName,
                manifestPaths,
                sourcesByToken.keySet(),
                fingerprint == null ? null : fingerprint.algorithmVersion(),
                fingerprint == null ? 0 : fingerprint.eligibleFileCount(),
                fingerprint == null ? 0 : fingerprint.sampledFileCount(),
                fingerprint == null ? 0 : fingerprint.tokenCount(),
                fingerprint == null ? 0 : fingerprint.shingleCount());

        return new GithubRepositoryScanResult(sourcesByToken, fingerprint);
    }

    private ArtifactSemanticFingerprint buildFingerprint(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch,
            List<GithubTreeResponse.Entry> tree,
            Map<String, String> contentByPath
    ) {
        List<GithubTreeResponse.Entry> eligible = tree.stream()
                .filter(repositoryFilePolicy::isEligible)
                .sorted(Comparator
                        .comparingLong(this::sizeOrZero)
                        .reversed()
                        .thenComparing(GithubTreeResponse.Entry::path))
                .toList();
        List<GithubTreeResponse.Entry> selected = selectWithinBudget(eligible);
        List<ArtifactSemanticFingerprintGenerator.SourceDocument> documents = new ArrayList<>();
        for (GithubTreeResponse.Entry entry : selected) {
            String content = fetchTextContent(
                    accessToken, owner, repo, defaultBranch, entry.path(), contentByPath);
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
            if (selected.size() >= MAX_FINGERPRINT_FILES_PER_REPO) {
                break;
            }
            if (!selected.isEmpty() && size > 0
                    && selectedBytes + size > MAX_FINGERPRINT_BYTES_PER_REPO) {
                continue;
            }
            selected.add(entry);
            selectedBytes += size;
        }
        return List.copyOf(selected);
    }

    private String fetchTextContent(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch,
            String path,
            Map<String, String> contentByPath
    ) {
        if (contentByPath.containsKey(path)) {
            return contentByPath.get(path);
        }
        try {
            String content = githubApiClient.fetchTextFile(
                    accessToken, owner, repo, defaultBranch, path);
            contentByPath.put(path, content);
            return content;
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub repository content fetch unauthorized. Reconnect is required.",
                        exception);
            }
            return null;
        } catch (RestClientException | IllegalArgumentException exception) {
            return null;
        }
    }

    private long sizeOrZero(GithubTreeResponse.Entry entry) {
        return Optional.ofNullable(entry.size()).orElse(0L);
    }

    private String fileName(String path) {
        if (isBlank(path)) {
            return "";
        }
        int lastSlash = path.lastIndexOf('/');
        return lastSlash < 0 ? path : path.substring(lastSlash + 1);
    }

    private String[] splitRepoFullName(String fullName) {
        if (isBlank(fullName) || !fullName.contains("/")) {
            return null;
        }

        String[] parts = fullName.split("/", 2);
        if (isBlank(parts[0]) || isBlank(parts[1])) {
            return null;
        }
        return parts;
    }
}
