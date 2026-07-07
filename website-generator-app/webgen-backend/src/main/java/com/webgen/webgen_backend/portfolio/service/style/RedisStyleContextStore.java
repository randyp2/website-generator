package com.webgen.webgen_backend.portfolio.service.style;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

/**
 * Redis-backed style context store (JSON values, same pattern as the
 * clarifier session store). Contexts survive backend restarts and are shared
 * across instances.
 */
@Component
@RequiredArgsConstructor
public class RedisStyleContextStore implements StyleContextStore {
    private static final Logger log = LoggerFactory.getLogger(RedisStyleContextStore.class);

    static final String KEY_PREFIX = "style:context:";
    /**
     * Generous window: the context must outlive the full create flow (style
     * chat, resume upload, generation), not just the chat session.
     */
    static final Duration TTL = Duration.ofHours(24);

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public StyleContext find(UUID portfolioId) {
        String json = redisTemplate.opsForValue().get(key(portfolioId));
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, StyleContext.class);
        } catch (JsonProcessingException e) {
            // A corrupt entry would otherwise fail every request for this
            // portfolio; treating it as absent restarts style discovery.
            log.error("[style-context] Dropping unreadable context for portfolio {}: {}",
                    portfolioId, e.getMessage());
            return null;
        }
    }

    @Override
    public void save(UUID portfolioId, StyleContext context) {
        try {
            String json = objectMapper.writeValueAsString(context);
            redisTemplate.opsForValue().set(key(portfolioId), json, TTL);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(
                    "Failed to serialize style context for portfolio " + portfolioId, e);
        }
    }

    private String key(UUID portfolioId) {
        return KEY_PREFIX + portfolioId;
    }
}
