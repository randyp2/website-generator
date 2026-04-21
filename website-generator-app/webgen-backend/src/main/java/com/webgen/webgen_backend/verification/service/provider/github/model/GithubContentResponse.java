package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubContentResponse(
        @JsonProperty("encoding")
        String encoding,
        @JsonProperty("content")
        String content
) {}
