package com.webgen.webgen_backend.verification.service.provider.github.model;

public record GithubSyncTokenResult(
        String accessToken,
        boolean tokenRefreshed) {
}
