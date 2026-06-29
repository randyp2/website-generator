package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.normalizeForMatch;

@Slf4j
@Component
@RequiredArgsConstructor
public class GithubRepositorySignalScanner {

    private static final String PACKAGE_JSON_FILE_NAME = "package.json";

    private static final List<String> PACKAGE_DEPENDENCY_SECTIONS = List.of(
            "dependencies",
            "devDependencies",
            "peerDependencies",
            "optionalDependencies");

    private static final Set<String> BACKEND_BUILD_FILE_NAMES = Set.of(
            "pom.xml",
            "build.gradle",
            "build.gradle.kts",
            "settings.gradle",
            "settings.gradle.kts");

    // Manifest file names we know how to parse, matched anywhere in the repo tree.
    private static final Set<String> SCANNABLE_MANIFEST_FILE_NAMES = Stream.concat(
            Stream.of(PACKAGE_JSON_FILE_NAME),
            BACKEND_BUILD_FILE_NAMES.stream()
    ).collect(Collectors.toUnmodifiableSet());

    // Upper bound on manifests fetched per repo, so a large monorepo with many
    // manifests cannot trigger an unbounded number of content fetches.
    private static final int MAX_MANIFESTS_PER_REPO = 10;

    private final GithubApiClient githubApiClient;
    private final ObjectMapper objectMapper;

    /**
     * Scans a repository for dependency/build signals. Locates every known
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
                .filter(path -> SCANNABLE_MANIFEST_FILE_NAMES.contains(fileName(path)))
                .limit(MAX_MANIFESTS_PER_REPO)
                .toList();

        if (manifestPaths.isEmpty()) {
            return Set.of();
        }

        Set<String> signals = new LinkedHashSet<>();
        for (String path : manifestPaths) {
            String content = fetchManifestContent(accessToken, owner, repo, defaultBranch, path);
            if (isBlank(content)) {
                continue;
            }
            if (PACKAGE_JSON_FILE_NAME.equals(fileName(path))) {
                signals.addAll(parsePackageJsonDependencies(content));
            } else {
                signals.addAll(parseBackendBuildSignals(content));
            }
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

    private Set<String> parsePackageJsonDependencies(String content) {
        try {
            return extractDependenciesFromPackageJson(objectMapper.readTree(content));
        } catch (Exception exception) {
            return Set.of();
        }
    }

    private Set<String> extractDependenciesFromPackageJson(JsonNode packageJson) {
        if (packageJson == null || !packageJson.isObject()) {
            return Set.of();
        }

        Set<String> dependencies = new LinkedHashSet<>();
        for (String section : PACKAGE_DEPENDENCY_SECTIONS) {
            JsonNode node = packageJson.get(section);
            if (node == null || !node.isObject()) {
                continue;
            }
            node.fieldNames().forEachRemaining(dep -> addMatchingTerm(dependencies, dep));
        }
        return dependencies;
    }

    private Set<String> parseBackendBuildSignals(String content) {
        String normalized = normalizeForMatch(content);
        if (isBlank(normalized)) {
            return Set.of();
        }

        Set<String> signals = new LinkedHashSet<>();
        // Presence of a JVM build file is itself a strong backend indicator.
        addMatchingTerm(signals, "java");
        if (normalized.contains("spring boot")
                || normalized.contains("spring-boot")
                || normalized.contains("org.springframework.boot")) {
            addMatchingTerm(signals, "spring");
            addMatchingTerm(signals, "spring boot");
            addMatchingTerm(signals, "springboot");
        }
        return signals;
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
