package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Minimal commit structure used to assess direct and merge contribution activity. */
public record GithubCommitResponse(
        @JsonProperty("sha") String sha,
        @JsonProperty("commit") CommitDetails commit,
        @JsonProperty("parents") List<Parent> parents
) {
    public record CommitDetails(
            @JsonProperty("author") GitIdentity author,
            @JsonProperty("committer") GitIdentity committer
    ) {}

    public record GitIdentity(@JsonProperty("date") String date) {}

    public record Parent(@JsonProperty("sha") String sha) {}
}
