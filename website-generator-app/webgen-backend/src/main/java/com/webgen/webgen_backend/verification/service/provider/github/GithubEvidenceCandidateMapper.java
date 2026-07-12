package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubAuthorshipSignal;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubRepoResponse;
import com.webgen.webgen_backend.verification.service.provider.github.model.GithubUserResponse;
import com.webgen.webgen_backend.verification.service.sync.model.EvidenceCandidate;
import com.webgen.webgen_backend.verification.service.shared.EvidenceGroupKeyFactory;
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
    private final EvidenceGroupKeyFactory evidenceGroupKeyFactory;

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
                evidenceGroupKeyFactory.forGithubProfile(profile.id(), externalId),
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
        return fromRepository(
                repo,
                dependencySources,
                GithubAuthorshipSignal.unavailable("not_assessed"),
                capturedAt);
    }

    public EvidenceCandidate fromRepository(
            GithubRepoResponse repo,
            Map<String, String> dependencySources,
            GithubAuthorshipSignal authorship,
            OffsetDateTime capturedAt) {
        if (repo == null || isBlank(repo.fullName())) {
            return null;
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("kind", "repository");
        metadata.put("full_name", repo.fullName());
        metadata.put("repo_name", repo.name());
        if (repo.id() != null) {
            metadata.put("repository_id", repo.id());
        }
        metadata.put("fork", repo.isFork());
        GithubRepoResponse.RepositoryIdentity root = repo.source() != null
                ? repo.source()
                : repo.parent();
        if (root != null && root.id() != null) {
            metadata.put("root_repository_id", root.id());
            metadata.put("root_repository_name", root.fullName());
        }
        if (repo.description() != null) {
            metadata.put("description", repo.description());
        }
        if (repo.primaryLanguage() != null) {
            metadata.put("primary_language", repo.primaryLanguage());
        }
        if (repo.pushedAt() != null) {
            metadata.put("pushed_at", repo.pushedAt());
        }

        GithubAuthorshipSignal resolvedAuthorship = authorship == null
                ? GithubAuthorshipSignal.unavailable("not_assessed")
                : authorship;
        ObjectNode authorshipNode = metadata.putObject("authorship");
        authorshipNode.put("status", resolvedAuthorship.status().name().toLowerCase(Locale.ROOT));
        authorshipNode.put("authoredCommitCount", resolvedAuthorship.authoredCommitCount());
        authorshipNode.put("directCommitCount", resolvedAuthorship.directCommitCount());
        authorshipNode.put("mergeCommitCount", resolvedAuthorship.mergeCommitCount());
        authorshipNode.put("activeDayCount", resolvedAuthorship.activeDayCount());
        authorshipNode.put("weight", resolvedAuthorship.weight());
        authorshipNode.put("reason", resolvedAuthorship.reason());

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

        String externalId = "repo:" + repo.fullName().toLowerCase(Locale.ROOT);
        return new EvidenceCandidate(
                externalId,
                evidenceGroupKeyFactory.forGithubRepository(repo, externalId),
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
