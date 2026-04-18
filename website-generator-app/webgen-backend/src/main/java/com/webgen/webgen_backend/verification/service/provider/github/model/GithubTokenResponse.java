package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GithubTokenResponse(
        @JsonProperty("access_token")
        String accessToken,
        @JsonProperty("scope")
        String scope,
        @JsonProperty("refresh_token")
        String refreshToken,
        @JsonProperty("expires_in")
        Long expiresIn,
        @JsonProperty("refresh_token_expires_in")
        Long refreshTokenExpiresIn,
        @JsonProperty("error")
        String error
) {}
