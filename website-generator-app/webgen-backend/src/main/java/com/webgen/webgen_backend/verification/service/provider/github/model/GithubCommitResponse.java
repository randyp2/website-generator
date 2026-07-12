package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Minimal GitHub commit payload used only for bounded authorship counting. */
public record GithubCommitResponse(@JsonProperty("sha") String sha) {}
