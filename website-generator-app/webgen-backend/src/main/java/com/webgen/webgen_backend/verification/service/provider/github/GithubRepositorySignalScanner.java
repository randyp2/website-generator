package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.manifest.ManifestDependencyParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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

    /**
     * Scans a repository for dependency/build signals. Locates every parseable
     * manifest anywhere in the repo with a single Git Trees call, then fetches and
     * parses only those manifests, merging their signals into one deterministic set.
     */
    public Set<String> scanRepository(String accessToken, String fullName, String defaultBranch) {
        String[] repoParts = splitRepoFullName(fullName);
        if (repoParts == null) {
            return Set.of();
        }
        String owner = repoParts[0];
        String repo = repoParts[1];

        List<String> manifestPaths = githubApiClient
                .fetchRepositoryTree(accessToken, owner, repo, defaultBranch)
                .stream()
                .filter(path -> manifestDependencyParser.canParse(fileName(path)))
                .limit(MAX_MANIFESTS_PER_REPO)
                .toList();

        if (manifestPaths.isEmpty()) {
            return Set.of();
        }

        Set<String> signals = new LinkedHashSet<>();
        for (String path : manifestPaths) {
            String content = fetchManifestContent(accessToken, owner, repo, defaultBranch, path);
            signals.addAll(manifestDependencyParser.parse(fileName(path), content));
        }

        log.info(
                "connection.sync.repo_scan fullName={} manifests={} signals={}",
                fullName,
                manifestPaths,
                signals);

        return signals;
    }

    private String fetchManifestContent(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch,
            String path) {
        try {
            return githubApiClient.fetchTextFile(accessToken, owner, repo, defaultBranch, path);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub manifest fetch unauthorized. Reconnect is required.",
                        exception);
            }
            return null;
        } catch (Exception exception) {
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
