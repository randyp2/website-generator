package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GithubRepoResponse(
        @JsonProperty("id")
        Long id,
        @JsonProperty("name")
        String name,
        @JsonProperty("full_name")
        String fullName,
        @JsonProperty("description")
        String description,
        @JsonProperty("html_url")
        String htmlUrl,
        @JsonProperty("pushed_at")
        String pushedAt,
        @JsonProperty("language")
        String primaryLanguage,
        @JsonProperty("topics")
        List<String> topics,
        @JsonProperty("default_branch")
        String defaultBranch,
        @JsonProperty("fork")
        Boolean fork,
        @JsonProperty("parent")
        RepositoryIdentity parent,
        @JsonProperty("source")
        RepositoryIdentity source
) {
    public GithubRepoResponse(
            String name,
            String fullName,
            String description,
            String htmlUrl,
            String pushedAt,
            String primaryLanguage,
            List<String> topics,
            String defaultBranch
    ) {
        this(null, name, fullName, description, htmlUrl, pushedAt, primaryLanguage,
                topics, defaultBranch, false, null, null);
    }

    public boolean isFork() {
        return Boolean.TRUE.equals(fork);
    }

    public record RepositoryIdentity(
            @JsonProperty("id") Long id,
            @JsonProperty("full_name") String fullName
    ) {}
}
