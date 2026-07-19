package com.webgen.webgen_backend.verification.service.provider.github;

import com.fasterxml.jackson.databind.JsonNode;

/** Resolves the root repository identity persisted on a GitHub evidence candidate. */
final class GithubRepositoryLineageIdentity {

    private GithubRepositoryLineageIdentity() {}

    static Long resolve(JsonNode metadata) {
        if (metadata == null) {
            return null;
        }
        JsonNode rootId = metadata.path("root_repository_id");
        JsonNode repositoryId = metadata.path("repository_id");
        if (rootId.canConvertToLong()) {
            return rootId.longValue();
        }
        return repositoryId.canConvertToLong() ? repositoryId.longValue() : null;
    }
}
