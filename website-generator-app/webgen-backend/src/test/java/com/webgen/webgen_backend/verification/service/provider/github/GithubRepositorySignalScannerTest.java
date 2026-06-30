package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.GoModParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.JvmBuildFileParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.ManifestDependencyParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.PackageJsonParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.RequirementsTxtParser;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class GithubRepositorySignalScannerTest {

    private final ManifestDependencyParser parser = new ManifestDependencyParser(List.of(
            new PackageJsonParser(new ObjectMapper()),
            new RequirementsTxtParser(),
            new GoModParser(),
            new JvmBuildFileParser()));

    @Test
    void scansManifestsAnywhereInTreeAndMergesSignals() {
        Map<String, String> files = new LinkedHashMap<>();
        files.put("frontend/package.json", "{\"dependencies\":{\"react\":\"18\"}}");
        files.put("services/api/requirements.txt", "fastapi==0.110.0\n");
        files.put("go.mod", "module x\n\nrequire github.com/gin-gonic/gin v1.9.1\n");
        files.put("README.md", "# not a manifest");

        StubGithubApiClient client = new StubGithubApiClient(new ArrayList<>(files.keySet()), files);
        GithubRepositorySignalScanner scanner = new GithubRepositorySignalScanner(client, parser);

        Set<String> signals = scanner.scanRepository("token", "octo/app", "main");

        // Manifests are found at any depth, and each routes to the right parser.
        assertThat(signals).contains("react", "fastapi", "gin");
        // Files without a parser are never fetched.
        assertThat(client.fetchedPaths).doesNotContain("README.md");
    }

    @Test
    void returnsEmptyWhenNoParseableManifestsExist() {
        Map<String, String> files = Map.of(
                "README.md", "# hi",
                "src/index.ts", "export {}");
        StubGithubApiClient client = new StubGithubApiClient(new ArrayList<>(files.keySet()), files);
        GithubRepositorySignalScanner scanner = new GithubRepositorySignalScanner(client, parser);

        assertThat(scanner.scanRepository("token", "octo/app", "main")).isEmpty();
        assertThat(client.fetchedPaths).isEmpty();
    }

    @Test
    void capsManifestFetchesPerRepo() {
        Map<String, String> files = new LinkedHashMap<>();
        List<String> tree = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            String path = "module-" + i + "/package.json";
            tree.add(path);
            files.put(path, "{\"dependencies\":{\"react\":\"18\"}}");
        }

        StubGithubApiClient client = new StubGithubApiClient(tree, files);
        GithubRepositorySignalScanner scanner = new GithubRepositorySignalScanner(client, parser);

        scanner.scanRepository("token", "octo/app", "main");

        // Only MAX_MANIFESTS_PER_REPO (10) of the 15 manifests are fetched.
        assertThat(client.fetchedPaths).hasSize(10);
    }

    private static final class StubGithubApiClient extends GithubApiClient {
        private final List<String> treePaths;
        private final Map<String, String> contentByPath;
        private final List<String> fetchedPaths = new ArrayList<>();

        StubGithubApiClient(List<String> treePaths, Map<String, String> contentByPath) {
            this.treePaths = treePaths;
            this.contentByPath = contentByPath;
        }

        @Override
        public List<String> fetchRepositoryTree(String accessToken, String owner, String repo, String ref) {
            return treePaths;
        }

        @Override
        public String fetchTextFile(String accessToken, String owner, String repo, String defaultBranch, String path) {
            fetchedPaths.add(path);
            return contentByPath.get(path);
        }
    }
}
