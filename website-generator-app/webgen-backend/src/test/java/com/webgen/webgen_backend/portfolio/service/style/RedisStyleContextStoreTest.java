package com.webgen.webgen_backend.portfolio.service.style;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.style.StyleColorPresetDTO;
import com.webgen.webgen_backend.portfolio.model.style.CompiledStylePreferences;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.portfolio.model.style.StyleQAPair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RedisStyleContextStoreTest {

    private ValueOperations<String, String> valueOps;
    private RedisStyleContextStore store;
    private UUID portfolioId;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        RedisTemplate<String, String> redisTemplate = mock(RedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        store = new RedisStyleContextStore(redisTemplate, new ObjectMapper());
        portfolioId = UUID.randomUUID();
    }

    @Test
    void contextSurvivesSerializationRoundtrip() {
        StyleContext context = new StyleContext();
        context.setCurrentQuestionNumber(7);
        context.setStyleDiscoveryComplete(true);
        context.setDesignGoal("playful spiderman portfolio");
        context.setRecommendedColorPresets(List.of(new StyleColorPresetDTO(
                "Hero",
                "High contrast superhero palette.",
                Map.of("primary", "#ff0000")
        )));
        context.setRecommendedHeadingFont("Bangers");
        context.setRecommendedBodyFont("Inter");
        StyleQAPair qa = new StyleQAPair();
        qa.setQuestionNumber(4);
        qa.setQuestion("Tone?");
        qa.setAnswer("Minimal");
        context.setConversationHistory(List.of(qa));
        CompiledStylePreferences prefs = new CompiledStylePreferences();
        prefs.setTone("minimal");
        context.setCompiledStylePreferences(prefs);

        store.save(portfolioId, context);

        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        String expectedKey = RedisStyleContextStore.KEY_PREFIX + portfolioId;
        verify(valueOps).set(eq(expectedKey), json.capture(), eq(RedisStyleContextStore.TTL));

        when(valueOps.get(expectedKey)).thenReturn(json.getValue());
        StyleContext loaded = store.find(portfolioId);

        assertEquals(7, loaded.getCurrentQuestionNumber());
        assertTrue(loaded.isStyleDiscoveryComplete());
        assertEquals("Minimal", loaded.getConversationHistory().get(0).getAnswer());
        assertEquals("minimal", loaded.getCompiledStylePreferences().getTone());
        assertEquals("Hero", loaded.getRecommendedColorPresets().get(0).getName());
        assertEquals("Bangers", loaded.getRecommendedHeadingFont());
        assertEquals("Inter", loaded.getRecommendedBodyFont());
    }

    @Test
    void unreadableEntryIsTreatedAsAbsent() {
        when(valueOps.get(RedisStyleContextStore.KEY_PREFIX + portfolioId))
                .thenReturn("not-json{");

        assertNull(store.find(portfolioId));
    }
}
