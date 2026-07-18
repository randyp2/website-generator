package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClarifierConversationHistoryPolicyTest {
    private final ClarifierConversationHistoryPolicy policy =
            new ClarifierConversationHistoryPolicy();

    @Test
    void retainsThreeNewestUserAssistantExchanges() {
        List<ClarifierConversationMessage> history = new ArrayList<>();
        history = policy.appendExchange(history, "user one", "assistant one");
        history = policy.appendExchange(history, "user two", "assistant two");
        history = policy.appendExchange(history, "user three", "assistant three");
        history = policy.appendExchange(history, "user four", "assistant four");

        assertThat(history)
                .extracting(ClarifierConversationMessage::content)
                .containsExactly(
                        "user two",
                        "assistant two",
                        "user three",
                        "assistant three",
                        "user four",
                        "assistant four"
                );
    }

    @Test
    void boundsIndividualMessagesAndTotalHistorySize() {
        String oversized = "x".repeat(1_500);
        List<ClarifierConversationMessage> history = new ArrayList<>();
        history = policy.appendExchange(history, oversized, oversized);
        history = policy.appendExchange(history, oversized, oversized);
        history = policy.appendExchange(history, oversized, oversized);

        assertThat(history).allSatisfy(message ->
                assertThat(message.content()).hasSizeLessThanOrEqualTo(
                        ClarifierConversationHistoryPolicy.MAX_MESSAGE_CHARACTERS
                )
        );
        assertThat(history.stream().mapToInt(message -> message.content().length()).sum())
                .isLessThanOrEqualTo(ClarifierConversationHistoryPolicy.MAX_HISTORY_CHARACTERS);
    }
}
