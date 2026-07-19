package com.webgen.webgen_backend.portfolio.model.clarifier;

/** One bounded user or assistant message retained for active clarification context. */
public record ClarifierConversationMessage(Role role, String content) {

    public ClarifierConversationMessage {
        if (role == null) {
            throw new IllegalArgumentException("Clarifier conversation role is required");
        }
        if (content == null) {
            throw new IllegalArgumentException("Clarifier conversation content is required");
        }
    }

    public enum Role {
        USER,
        ASSISTANT
    }
}
