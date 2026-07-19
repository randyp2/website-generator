package com.webgen.webgen_backend.portfolio.model.clarifier;

import java.util.List;

/** Active clarification state stored for the lifetime of one refinement session. */
public record ClarifierSessionState(
        ClarifierContext context,
        List<ClarifierConversationMessage> recentMessages
) {
    public ClarifierSessionState {
        if (context == null) {
            throw new IllegalArgumentException("Clarifier context is required");
        }
        recentMessages = recentMessages == null ? List.of() : List.copyOf(recentMessages);
    }
}
