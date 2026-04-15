package com.webgen.webgen_backend.resume_verification_service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GithubRepoResponse(
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
        String defaultBranch
) {}
