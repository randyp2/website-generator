package com.webgen.webgen_backend.verification.service.provider.github;

import com.webgen.webgen_backend.verification.service.provider.github.model.GithubTreeResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GithubRepositoryFilePolicyTest {

    private final GithubRepositoryFilePolicy policy = new GithubRepositoryFilePolicy();

    @Test
    void includesSourceTestsAndBuildConfiguration() {
        assertThat(policy.isEligible(entry("src/main/App.java", 2_000L))).isTrue();
        assertThat(policy.isEligible(entry("src/test/AppTest.java", 2_000L))).isTrue();
        assertThat(policy.isEligible(entry("frontend/package.json", 2_000L))).isTrue();
    }

    @Test
    void excludesDocumentationDependenciesGeneratedFilesAndLargeFiles() {
        assertThat(policy.isEligible(entry("README.md", 2_000L))).isFalse();
        assertThat(policy.isEligible(entry("node_modules/lib/index.js", 2_000L))).isFalse();
        assertThat(policy.isEligible(entry("src/generated/Client.java", 2_000L))).isFalse();
        assertThat(policy.isEligible(entry("docs/conf.py", 2_000L))).isFalse();
        assertThat(policy.isEligible(entry(".github/workflows/test.yml", 2_000L))).isFalse();
        assertThat(policy.isEligible(entry("src/App.java", 200_001L))).isFalse();
    }

    private GithubTreeResponse.Entry entry(String path, long size) {
        return new GithubTreeResponse.Entry(path, "blob", "sha", size);
    }
}
