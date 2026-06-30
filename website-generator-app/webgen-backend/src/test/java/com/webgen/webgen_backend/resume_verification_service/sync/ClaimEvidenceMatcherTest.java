package com.webgen.webgen_backend.resume_verification_service.sync;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.service.sync.ClaimEvidenceMatcher;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimEvidenceMatchResult;
import com.webgen.webgen_backend.verification.service.sync.model.ClaimTermSet;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClaimEvidenceMatcherTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ClaimEvidenceMatcher matcher = new ClaimEvidenceMatcher(objectMapper);

    @Test
    void dependencySignalCreatesStrongMatch() {
        ClaimTermSet termSet = matcher.buildTermSet("React", "React", List.of());
        Evidence evidence = repositoryEvidence(
                "portfolio-api",
                "Portfolio API",
                List.of("showcase"),
                List.of("react"),
                "JavaScript");

        ClaimEvidenceMatchResult result = matcher.evaluate(termSet, evidence);

        assertThat(result.matched()).isTrue();
        assertThat(result.linkType()).isEqualTo("dependency_match");
        assertThat(result.confidence()).isEqualByComparingTo("0.95");
        assertThat(result.metadata().get("signal").asText()).isEqualTo("dependency");
        // No dependencySources on this evidence, so no file is attributed.
        assertThat(result.metadata().has("source_file")).isFalse();
    }

    @Test
    void dependencyMatchRecordsSourceFileWhenAvailable() {
        ClaimTermSet termSet = matcher.buildTermSet("PostgreSQL", "PostgreSQL", List.of("postgres"));

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("repo_name", "infra");
        metadata.put("full_name", "owner/infra");
        metadata.putArray("topics");
        metadata.putArray("dependencies").add("postgres");
        metadata.putObject("dependencySources").put("postgres", "docker-compose.yml");

        Evidence evidence = Evidence.builder()
                .evidenceType("repository")
                .metadata(metadata)
                .build();

        ClaimEvidenceMatchResult result = matcher.evaluate(termSet, evidence);

        assertThat(result.linkType()).isEqualTo("dependency_match");
        assertThat(result.metadata().get("matched_term").asText()).isEqualTo("postgres");
        assertThat(result.metadata().get("source_file").asText()).isEqualTo("docker-compose.yml");
    }

    @Test
    void commonAliasesAreExpandedForMatching() {
        ClaimTermSet termSet = matcher.buildTermSet("Node.js", "Node.js", List.of());
        Evidence evidence = repositoryEvidence(
                "api-service",
                "Backend service",
                List.of(),
                List.of("nodejs"),
                "JavaScript");

        ClaimEvidenceMatchResult result = matcher.evaluate(termSet, evidence);

        assertThat(result.matched()).isTrue();
        assertThat(result.linkType()).isEqualTo("dependency_match");
        assertThat(result.metadata().get("matched_term").asText()).isEqualTo("nodejs");
    }

    @Test
    void languageOnlyDoesNotCreateMatch() {
        ClaimTermSet termSet = matcher.buildTermSet("Java", "Java", List.of());
        Evidence evidence = repositoryEvidence(
                "portfolio-api",
                null,
                List.of(),
                List.of(),
                "Java");

        ClaimEvidenceMatchResult result = matcher.evaluate(termSet, evidence);

        assertThat(result.matched()).isFalse();
    }

    private Evidence repositoryEvidence(
            String repoName,
            String description,
            List<String> topics,
            List<String> dependencies,
            String primaryLanguage) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("repo_name", repoName);
        metadata.put("full_name", "owner/" + repoName);
        if (primaryLanguage != null) {
            metadata.put("primary_language", primaryLanguage);
        }

        ArrayNode topicsArray = metadata.putArray("topics");
        topics.forEach(topicsArray::add);

        ArrayNode dependenciesArray = metadata.putArray("dependencies");
        dependencies.forEach(dependenciesArray::add);

        return Evidence.builder()
                .evidenceType("repository")
                .description(description)
                .metadata(metadata)
                .build();
    }
}
