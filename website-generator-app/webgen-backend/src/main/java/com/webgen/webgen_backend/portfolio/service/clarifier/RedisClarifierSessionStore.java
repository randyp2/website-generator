package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierSessionState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/** Redis-backed clarification memory shared across backend instances. */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisClarifierSessionStore implements ClarifierSessionStore {
    static final String KEY_PREFIX = "clarifier:context:";
    static final Duration TTL = Duration.ofMinutes(30);

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public ClarifierSessionState find(String sessionId) {
        String json = redisTemplate.opsForValue().get(key(sessionId));
        if (json == null) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.has("context")) {
                return objectMapper.treeToValue(root, ClarifierSessionState.class);
            }

            // Contexts written before conversation memory was introduced used
            // the raw ClarifierContext shape. Preserve those active sessions.
            ClarifierContext legacyContext = objectMapper.treeToValue(root, ClarifierContext.class);
            return new ClarifierSessionState(legacyContext, List.of());
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            log.error(
                    "[clarifier-session] Dropping unreadable state for session {}: {}",
                    sessionId,
                    exception.getMessage()
            );
            return null;
        }
    }

    @Override
    public void save(String sessionId, ClarifierSessionState state) {
        try {
            String json = objectMapper.writeValueAsString(state);
            redisTemplate.opsForValue().set(key(sessionId), json, TTL);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Failed to serialize clarifier state for session " + sessionId,
                    exception
            );
        }
    }

    private String key(String sessionId) {
        return KEY_PREFIX + sessionId;
    }
}
