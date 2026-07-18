package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierSessionState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RedisClarifierSessionStoreTest {
    private static final String SESSION_ID = "refinement-session-id";

    private ValueOperations<String, String> valueOperations;
    private RedisClarifierSessionStore store;
    private ObjectMapper objectMapper;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        RedisTemplate<String, String> redisTemplate = mock(RedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        objectMapper = new ObjectMapper();
        store = new RedisClarifierSessionStore(redisTemplate, objectMapper);
    }

    @Test
    void sessionStateSurvivesSerializationRoundTrip() {
        ClarifierContext context = new ClarifierContext();
        context.setGlobalIntent("Update the hero tagline");
        ClarifierSessionState state = new ClarifierSessionState(
                context,
                List.of(
                        new ClarifierConversationMessage(
                                ClarifierConversationMessage.Role.USER,
                                "Change the hero tagline"
                        ),
                        new ClarifierConversationMessage(
                                ClarifierConversationMessage.Role.ASSISTANT,
                                "What should the new tagline say?"
                        )
                )
        );

        store.save(SESSION_ID, state);

        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        String key = RedisClarifierSessionStore.KEY_PREFIX + SESSION_ID;
        verify(valueOperations).set(eq(key), json.capture(), eq(RedisClarifierSessionStore.TTL));
        when(valueOperations.get(key)).thenReturn(json.getValue());

        ClarifierSessionState loaded = store.find(SESSION_ID);

        assertThat(loaded.context().getGlobalIntent()).isEqualTo("Update the hero tagline");
        assertThat(loaded.recentMessages()).hasSize(2);
        assertThat(loaded.recentMessages().getLast().content())
                .isEqualTo("What should the new tagline say?");
    }

    @Test
    void loadsLegacyRawContextWithoutConversationMessages() throws Exception {
        ClarifierContext legacyContext = new ClarifierContext();
        legacyContext.setGlobalIntent("Keep the existing request");
        when(valueOperations.get(RedisClarifierSessionStore.KEY_PREFIX + SESSION_ID))
                .thenReturn(objectMapper.writeValueAsString(legacyContext));

        ClarifierSessionState loaded = store.find(SESSION_ID);

        assertThat(loaded.context().getGlobalIntent()).isEqualTo("Keep the existing request");
        assertThat(loaded.recentMessages()).isEmpty();
    }
}
