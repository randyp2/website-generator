package com.webgen.webgen_backend.verification.service.provider.github.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Response from the GitHub Git Trees API
 * (GET /repos/{owner}/{repo}/git/trees/{ref}?recursive=1).
 *
 * Returns a repository's entire file listing in a single call. When the tree
 * exceeds GitHub's response limits, truncated is true and the tree is incomplete.
 */
public record GithubTreeResponse(
        @JsonProperty("tree")
        List<Entry> tree,
        @JsonProperty("truncated")
        boolean truncated
) {

    /**
     * A single tree entry. type is "blob" for files and "tree" for directories;
     * path is repo-root-relative.
     */
    public record Entry(
            @JsonProperty("path")
            String path,
            @JsonProperty("type")
            String type,
            @JsonProperty("sha")
            String sha,
            @JsonProperty("size")
            Long size
    ) {}
}
