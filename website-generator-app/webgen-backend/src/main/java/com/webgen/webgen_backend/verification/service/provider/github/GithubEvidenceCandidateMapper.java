package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;

import static com.webgen.webgen_backend.verification.service.sync.VerificationMatchTextHelper.isBlank;

@Component
@RequiredArgsConstructor
public class GithubEvidenceCandidateMapper {

    private final ObjectMapper objectMapper;

    public EvidenceCandidate fromProfile(
            GithubUserResponse profile,
            OffsetDateTime capturedAt) {

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("kind", "profile");

        if (profile.login() != null) {
            metadata.put("login", profile.login());
        }
        if (profile.name() != null) {
            metadata.put("name", profile.name());
        }
        if (profile.bio() != null) {
            metadata.put("bio", profile.bio());
        }

        String externalId = "profile:" + profile.id();
        String title = isBlank(profile.name()) ? profile.login() : profile.name();

        return new EvidenceCandidate(
                externalId,
                "profile",
                title,
                profile.bio(),
                profile.htmlUrl(),
                parseOffsetDateTimeOrNull(profile.updatedAt()),
                capturedAt,
                metadata);
    }

    public EvidenceCandidate fromRepository(
            GithubRepoResponse repo,
            Map<String, String> dependencySources,
            OffsetDateTime capturedAt) {
        if (repo == null || isBlank(repo.fullName())) {
            return null;
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("kind", "repository");
        metadata.put("full_name", repo.fullName());
        metadata.put("repo_name", repo.name());
        if (repo.description() != null) {
            metadata.put("description", repo.description());
        }
        if (repo.primaryLanguage() != null) {
            metadata.put("primary_language", repo.primaryLanguage());
        }
        if (repo.pushedAt() != null) {
            metadata.put("pushed_at", repo.pushedAt());
        }

        ArrayNode topicsArray = metadata.putArray("topics");
        if (repo.topics() != null) {
            repo.topics().forEach(topicsArray::add);
        }

        // dependencies: sorted token list consumed by claim matching.
        ArrayNode dependenciesArray = metadata.putArray("dependencies");
        dependencySources.keySet().stream().sorted().forEach(dependenciesArray::add);

        // dependencySources: token -> manifest file it was found in, for match provenance.
        ObjectNode dependencySourcesNode = metadata.putObject("dependencySources");
        dependencySources.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> dependencySourcesNode.put(entry.getKey(), entry.getValue()));

        return new EvidenceCandidate(
                "repo:" + repo.fullName().toLowerCase(Locale.ROOT),
                "repository",
                repo.fullName(),
                repo.description(),
                repo.htmlUrl(),
                parseOffsetDateTimeOrNull(repo.pushedAt()),
                capturedAt,
                metadata);
    }

    private OffsetDateTime parseOffsetDateTimeOrNull(String value) {
        if (isBlank(value)) {
            return null;
        }

        try {
            return OffsetDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }
}
