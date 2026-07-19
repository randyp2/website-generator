package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Bounds active model context without changing the durable refine transcript. */
@Component
public class ClarifierConversationHistoryPolicy {
    static final int MAX_MESSAGES = 6;
    static final int MAX_MESSAGE_CHARACTERS = 1_000;
    static final int MAX_HISTORY_CHARACTERS = 4_000;

    /** Appends one completed exchange and returns the bounded chronological history. */
    public List<ClarifierConversationMessage> appendExchange(
            List<ClarifierConversationMessage> history,
            String userMessage,
            String assistantMessage
    ) {
        List<ClarifierConversationMessage> messages = new ArrayList<>();
        if (history != null) {
            messages.addAll(history);
        }
        add(messages, ClarifierConversationMessage.Role.USER, userMessage);
        add(messages, ClarifierConversationMessage.Role.ASSISTANT, assistantMessage);
        return retainNewest(messages);
    }

    private void add(
            List<ClarifierConversationMessage> messages,
            ClarifierConversationMessage.Role role,
            String content
    ) {
        if (content == null || content.isBlank()) {
            return;
        }
        String normalized = content.strip();
        if (normalized.length() > MAX_MESSAGE_CHARACTERS) {
            normalized = normalized.substring(0, MAX_MESSAGE_CHARACTERS);
        }
        messages.add(new ClarifierConversationMessage(role, normalized));
    }

    private List<ClarifierConversationMessage> retainNewest(
            List<ClarifierConversationMessage> messages
    ) {
        List<ClarifierConversationMessage> newestFirst = new ArrayList<>();
        int characterCount = 0;

        for (int index = messages.size() - 1;
             index >= 0 && newestFirst.size() < MAX_MESSAGES;
             index -= 1) {
            ClarifierConversationMessage message = messages.get(index);
            if (message == null || message.content() == null || message.content().isBlank()) {
                continue;
            }

            String content = message.content().strip();
            if (content.length() > MAX_MESSAGE_CHARACTERS) {
                content = content.substring(0, MAX_MESSAGE_CHARACTERS);
            }
            if (characterCount + content.length() > MAX_HISTORY_CHARACTERS) {
                break;
            }

            newestFirst.add(new ClarifierConversationMessage(message.role(), content));
            characterCount += content.length();
        }

        Collections.reverse(newestFirst);
        return List.copyOf(newestFirst);
    }
}
