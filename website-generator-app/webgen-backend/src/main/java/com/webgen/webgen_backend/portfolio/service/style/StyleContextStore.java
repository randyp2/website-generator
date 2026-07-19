package com.webgen.webgen_backend.portfolio.service.style;

import com.webgen.webgen_backend.portfolio.model.style.StyleContext;

import java.util.UUID;

/**
 * Persistence boundary for style discovery state, keyed by portfolio id.
 * Implementations hold serialized copies, so every mutation must be followed
 * by an explicit {@link #save} to take effect.
 */
public interface StyleContextStore {

    /** Returns the stored context, or null when absent or expired. */
    StyleContext find(UUID portfolioId);

    void save(UUID portfolioId, StyleContext context);
}
