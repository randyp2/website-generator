package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubPathEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.addMatchingTerm;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;
import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.normalizeForMatch;

@Slf4j
@Component
@RequiredArgsConstructor
public class GithubRepositorySignalScanner {

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

    private static final int BACKEND_DISCOVERY_MAX_ROOT_DIRS = 40;
    private static final int BACKEND_DISCOVERY_MAX_SUBDIRS_PER_ROOT = 40;

    private final GithubApiClient githubApiClient;
    private final ObjectMapper objectMapper;

    public Set<String> fetchPackageDependencies(
            String accessToken,
            String fullName,
            String defaultBranch) {
        String[] repoParts = splitRepoFullName(fullName);
        if (repoParts == null) {
            return Set.of();
        }

        try {
            String packageJsonText = githubApiClient.fetchTextFile(
                    accessToken,
                    repoParts[0],
                    repoParts[1],
                    defaultBranch,
                    "package.json");
            if (isBlank(packageJsonText)) {
                return Set.of();
            }
            JsonNode packageJson = objectMapper.readTree(packageJsonText);
            return extractDependenciesFromPackageJson(packageJson);
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                return Set.of();
            }
            if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                    || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "GitHub package fetch unauthorized. Reconnect is required.",
                        exception);
            }
            return Set.of();
        } catch (Exception exception) {
            return Set.of();
        }
    }

    public Set<String> fetchBackendSignals(
            String accessToken,
            String fullName,
            String defaultBranch) {
        String[] repoParts = splitRepoFullName(fullName);
        if (repoParts == null) {
            return Set.of();
        }

        Set<String> signals = new LinkedHashSet<>();
        Set<String> foundPaths = new LinkedHashSet<>();
        List<String> candidatePaths = discoverBackendBuildFilePaths(
                accessToken,
                repoParts[0],
                repoParts[1],
                defaultBranch);
        int attemptedPaths = 0;
        int notFoundCount = 0;
        for (String path : candidatePaths) {
            attemptedPaths++;
            try {
                String fileContent = githubApiClient.fetchTextFile(
                        accessToken,
                        repoParts[0],
                        repoParts[1],
                        defaultBranch,
                        path);
                if (isBlank(fileContent)) {
                    continue;
                }

                String normalized = normalizeForMatch(fileContent);
                if (isBlank(normalized)) {
                    continue;
                }

                foundPaths.add(path);
                addMatchingTerm(signals, "java");

                if (normalized.contains("spring boot")
                        || normalized.contains("spring-boot")
                        || normalized.contains("org.springframework.boot")) {
                    addMatchingTerm(signals, "spring");
                    addMatchingTerm(signals, "spring boot");
                    addMatchingTerm(signals, "springboot");
                }
            } catch (RestClientResponseException exception) {
                if (exception.getStatusCode() == HttpStatus.NOT_FOUND) {
                    notFoundCount++;
                    continue;
                }
                if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED
                        || exception.getStatusCode() == HttpStatus.FORBIDDEN) {
                    throw new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "GitHub backend signal fetch unauthorized. Reconnect is required.",
                            exception);
                }
            } catch (Exception ignored) {
                // Backend signal extraction is best-effort and should not fail sync.
            }
        }

        log.info(
                "connection.sync.backend_probe fullName={} attemptedPaths={} candidates={} notFound={} foundPaths={} signals={}",
                fullName,
                attemptedPaths,
                candidatePaths,
                notFoundCount,
                foundPaths,
                signals);

        if (!signals.isEmpty()) {
            log.info(
                    "connection.sync.backend_signals_extracted fullName={} signals={}",
                    fullName,
                    signals);
        }

        return signals;
    }

    private List<String> discoverBackendBuildFilePaths(
            String accessToken,
            String owner,
            String repo,
            String defaultBranch) {
        LinkedHashSet<String> discovered = new LinkedHashSet<>();

        List<GithubPathEntry> rootEntries = githubApiClient.fetchDirectoryEntries(
                accessToken,
                owner,
                repo,
                defaultBranch,
                null);
        addBuildFilePaths(discovered, rootEntries);

        List<GithubPathEntry> rootDirectories = rootEntries.stream()
                .filter(entry -> "dir".equals(entry.type()))
                .limit(BACKEND_DISCOVERY_MAX_ROOT_DIRS)
                .toList();

        for (GithubPathEntry rootDirectory : rootDirectories) {
            List<GithubPathEntry> levelOneEntries = githubApiClient.fetchDirectoryEntries(
                    accessToken,
                    owner,
                    repo,
                    defaultBranch,
                    rootDirectory.path());
            addBuildFilePaths(discovered, levelOneEntries);

            List<GithubPathEntry> levelOneDirectories = levelOneEntries.stream()
                    .filter(entry -> "dir".equals(entry.type()))
                    .limit(BACKEND_DISCOVERY_MAX_SUBDIRS_PER_ROOT)
                    .toList();

            for (GithubPathEntry levelOneDirectory : levelOneDirectories) {
                List<GithubPathEntry> levelTwoEntries = githubApiClient.fetchDirectoryEntries(
                        accessToken,
                        owner,
                        repo,
                        defaultBranch,
                        levelOneDirectory.path());
                addBuildFilePaths(discovered, levelTwoEntries);
            }
        }

        return discovered.stream().sorted().toList();
    }

    private void addBuildFilePaths(Set<String> out, List<GithubPathEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            return;
        }

        for (GithubPathEntry entry : entries) {
            if (entry == null || !"file".equals(entry.type())) {
                continue;
            }
            if (!BACKEND_BUILD_FILE_NAMES.contains(entry.name())) {
                continue;
            }
            if (!isBlank(entry.path())) {
                out.add(entry.path());
            }
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
