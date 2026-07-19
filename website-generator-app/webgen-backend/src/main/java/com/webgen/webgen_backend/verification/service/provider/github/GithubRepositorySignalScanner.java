package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprint;
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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

@Slf4j
@Component
@RequiredArgsConstructor
public class GithubRepositorySignalScanner {

    // Upper bound on manifests fetched per repo, so a large monorepo with many
    // manifests cannot trigger an unbounded number of content fetches.
    private static final int MAX_MANIFESTS_PER_REPO = 10;
    private final GithubApiClient githubApiClient;
    private final ManifestDependencyParser manifestDependencyParser;
    private final GithubRepositoryFingerprintBuilder fingerprintBuilder;

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
                ? fingerprintBuilder.build(tree, path -> fetchTextContent(
                        accessToken, owner, repo, defaultBranch, path, contentByPath))
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
