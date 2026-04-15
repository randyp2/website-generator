package com.webgen.webgen_backend.resume_verification_service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubContentResponse(
        @JsonProperty("encoding")
        String encoding,
        @JsonProperty("content")
        String content
) {}
