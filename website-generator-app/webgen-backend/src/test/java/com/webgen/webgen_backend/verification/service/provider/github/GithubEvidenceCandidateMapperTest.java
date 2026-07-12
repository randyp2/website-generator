package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import com.webgen.webgen_backend.verification.service.shared.EvidenceGroupKeyFactory;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GithubEvidenceCandidateMapperTest {

    private final GithubEvidenceCandidateMapper mapper = new GithubEvidenceCandidateMapper(
            new ObjectMapper(), new EvidenceGroupKeyFactory());

    @Test
    void writesSortedDependenciesArrayAndSourceMap() {
        GithubRepoResponse repo = new GithubRepoResponse(
                "app",
                "octo/app",
                "demo repo",
                "https://github.com/octo/app",
                "2026-01-01T00:00:00Z",
                "Java",
                List.of("backend"),
                "main");

        Map<String, String> dependencySources = new LinkedHashMap<>();
        dependencySources.put("react", "frontend/package.json");
        dependencySources.put("postgres", "docker-compose.yml");

        EvidenceCandidate candidate = mapper.fromRepository(
                repo, dependencySources, OffsetDateTime.parse("2026-06-28T00:00:00Z"));

        JsonNode metadata = candidate.metadata();

        // dependencies: sorted token array (unchanged contract for claim matching).
        List<String> dependencies = new ArrayList<>();
        metadata.get("dependencies").forEach(node -> dependencies.add(node.asText()));
        assertThat(dependencies).containsExactly("postgres", "react");

        // dependencySources: token -> manifest file provenance.
        JsonNode sources = metadata.get("dependencySources");
        assertThat(sources.get("react").asText()).isEqualTo("frontend/package.json");
        assertThat(sources.get("postgres").asText()).isEqualTo("docker-compose.yml");
    }

    @Test
    void groupsForkByRootRepositoryIdentity() {
        GithubRepoResponse repo = new GithubRepoResponse(
                22L,
                "app-fork",
                "octo/app-fork",
                "fork",
                "https://github.com/octo/app-fork",
                "2026-01-01T00:00:00Z",
                "Java",
                List.of(),
                "main",
                true,
                new GithubRepoResponse.RepositoryIdentity(11L, "source/app"),
                new GithubRepoResponse.RepositoryIdentity(10L, "root/app"));

        EvidenceCandidate candidate = mapper.fromRepository(
                repo, Map.of(), OffsetDateTime.parse("2026-06-28T00:00:00Z"));

        assertThat(candidate.evidenceGroupKey()).isEqualTo("github:repository:10");
        assertThat(candidate.metadata().path("root_repository_id").asLong()).isEqualTo(10L);
    }
}
