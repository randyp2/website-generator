package com.webgen.webgen_backend.resume_verification_service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubUserResponse(
        @JsonProperty("id")
        Long id,
        @JsonProperty("login")
        String login,
        @JsonProperty("name")
        String name,
        @JsonProperty("bio")
        String bio,
        @JsonProperty("html_url")
        String htmlUrl,
        @JsonProperty("updated_at")
        String updatedAt
) {}
