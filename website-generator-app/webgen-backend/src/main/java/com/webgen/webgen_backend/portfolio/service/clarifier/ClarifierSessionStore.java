package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierSessionState;

/** Persistence boundary for active, session-scoped clarification memory. */
public interface ClarifierSessionStore {

    /** Returns the stored state, or {@code null} when absent or expired. */
    ClarifierSessionState find(String sessionId);

    void save(String sessionId, ClarifierSessionState state);
}
