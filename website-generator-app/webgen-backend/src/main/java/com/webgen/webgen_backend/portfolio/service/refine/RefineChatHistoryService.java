package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;

import java.util.List;
import java.util.UUID;

/**
 * Persistence boundary for per-portfolio refine chat history.
 */
public interface RefineChatHistoryService {
    /**
     * Loads refine chat history for a portfolio owned by the given user.
     *
     * @param userId authenticated portfolio owner id
     * @param portfolioId portfolio id whose refine history should be read
     * @return normalized refine chat history, never null
     */
    List<RefineChatMessage> loadHistory(UUID userId, UUID portfolioId);

    /**
     * Replaces refine chat history for a portfolio owned by the given user.
     *
     * @param userId authenticated portfolio owner id
     * @param portfolioId portfolio id whose refine history should be written
     * @param history client-provided refine history
     * @return normalized persisted refine chat history, never null
     */
    List<RefineChatMessage> saveHistory(
            UUID userId,
            UUID portfolioId,
            List<RefineChatMessage> history
    );
}
