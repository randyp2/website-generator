package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.entity.RefineChatSectionPlan;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RefineChatHistoryPolicyTest {
    private final RefineChatHistoryPolicy policy = new RefineChatHistoryPolicy();

    @Test
    void normalizeReturnsEmptyListForNullHistory() {
        assertTrue(policy.normalize(null).isEmpty());
    }

    @Test
    void normalizeCapsHistoryToLatestMessagesInOrder() {
        List<RefineChatMessage> history = new ArrayList<>();
        for (int index = 0; index < 205; index += 1) {
            history.add(message("message-" + index));
        }

        List<RefineChatMessage> normalized = policy.normalize(history);

        assertEquals(200, normalized.size());
        assertEquals("message-5", normalized.getFirst().getId());
        assertEquals("message-204", normalized.getLast().getId());
    }

    @Test
    void normalizeCreatesDefensiveCopies() {
        RefineChatSectionPlan plan = new RefineChatSectionPlan(
                "hero",
                "modify",
                "Make it sharper",
                "User asked for stronger intro",
                "MEDIUM",
                List.of("headline"),
                null,
                null,
                null
        );
        RefineChatMessage source = message("message-1");
        source.setSectionPlans(List.of(plan));

        List<RefineChatMessage> normalized = policy.normalize(List.of(source));

        assertNotSame(source, normalized.getFirst());
        assertNotSame(plan, normalized.getFirst().getSectionPlans().getFirst());
        assertEquals("hero", normalized.getFirst().getSectionPlans().getFirst().getSectionKey());
    }

    private RefineChatMessage message(String id) {
        return new RefineChatMessage(
                id,
                "ai",
                "content",
                "2026-07-10T00:00:00.000Z",
                false,
                "clarify",
                false,
                new ArrayList<>(),
                null
        );
    }
}
