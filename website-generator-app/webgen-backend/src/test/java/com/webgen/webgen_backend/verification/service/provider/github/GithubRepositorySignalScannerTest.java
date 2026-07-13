package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.fingerprint.ArtifactSemanticFingerprintGenerator;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.GoModParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.JvmBuildFileParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.ManifestDependencyParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.PackageJsonParser;
import com.webgen.webgen_backend.verification.service.provider.github.manifest.RequirementsTxtParser;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepositoryScanResult;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
        GithubRepositorySignalScanner scanner = scanner(client);

        Map<String, String> signalsBySource = scanner
                .scanRepository("token", "octo/app", "main", false)
                .dependencySources();

        // Manifests are found at any depth, each routes to the right parser, and
        // every token records the manifest file it was found in.
        assertThat(signalsBySource).containsEntry("react", "frontend/package.json");
        assertThat(signalsBySource).containsEntry("fastapi", "services/api/requirements.txt");
        assertThat(signalsBySource).containsEntry("gin", "go.mod");
        // Files without a parser are never fetched.
        assertThat(client.fetchedPaths).doesNotContain("README.md");
    }

    @Test
    void returnsEmptyWhenNoParseableManifestsExist() {
        Map<String, String> files = Map.of(
                "README.md", "# hi",
                "src/index.ts", "export {}");
        StubGithubApiClient client = new StubGithubApiClient(new ArrayList<>(files.keySet()), files);
        GithubRepositorySignalScanner scanner = scanner(client);

        assertThat(scanner.scanRepository("token", "octo/app", "main", false)
                .dependencySources()).isEmpty();
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
        GithubRepositorySignalScanner scanner = scanner(client);

        scanner.scanRepository("token", "octo/app", "main", false);

        // Only MAX_MANIFESTS_PER_REPO (10) of the 15 manifests are fetched.
        assertThat(client.fetchedPaths).hasSize(10);
    }

    @Test
    void fingerprintsMeaningfulSourceAndExcludesDocumentationAndDependencies() {
        StringBuilder sourceBuilder = new StringBuilder("public class AccountService {");
        for (int index = 0; index < 12; index++) {
            sourceBuilder.append("public Account create").append(index)
                    .append("(String email").append(index).append("){")
                    .append("validate").append(index).append("(email").append(index)
                    .append(");return repository.save(new Account(email")
                    .append(index).append("));}");
        }
        String source = sourceBuilder.append('}').toString();
        Map<String, String> files = new LinkedHashMap<>();
        files.put("src/AccountService.java", source);
        files.put("README.md", source);
        files.put("node_modules/library/index.js", source);

        StubGithubApiClient client = new StubGithubApiClient(new ArrayList<>(files.keySet()), files);
        GithubRepositoryScanResult result = scanner(client)
                .scanRepository("token", "octo/app", "main", true);

        assertThat(result.semanticFingerprint()).isNotNull();
        assertThat(result.semanticFingerprint().sampledPaths())
                .containsExactly("src/AccountService.java");
        assertThat(result.semanticFingerprint().isComparable()).isTrue();
        assertThat(client.fetchedPaths).containsExactly("src/AccountService.java");
    }

    private GithubRepositorySignalScanner scanner(GithubApiClient client) {
        return new GithubRepositorySignalScanner(
                client,
                parser,
                new GithubRepositoryFingerprintBuilder(
                        new GithubRepositoryFilePolicy(),
                        new ArtifactSemanticFingerprintGenerator()));
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
        public List<GithubTreeResponse.Entry> fetchRepositoryTreeEntries(
                String accessToken,
                String owner,
                String repo,
                String ref
        ) {
            return treePaths.stream()
                    .map(path -> new GithubTreeResponse.Entry(
                            path,
                            "blob",
                            "sha-" + path,
                            (long) contentByPath.getOrDefault(path, "").length()))
                    .toList();
        }

        @Override
        public String fetchTextFile(String accessToken, String owner, String repo, String defaultBranch, String path) {
            fetchedPaths.add(path);
            return contentByPath.get(path);
        }
    }
}
