package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Resolves terse replies against the assistant question they are answering. */
@Component
public class ClarifierReplyPolicy {
    private static final Set<String> AFFIRMATIVE_REPLIES = Set.of(
            "yes", "yes please", "yep", "yup", "yeah", "correct", "exactly",
            "sounds good", "looks good", "perfect", "proceed", "go ahead", "do it"
    );
    private static final Set<String> NEGATIVE_REPLIES = Set.of(
            "no", "nope", "nah", "no thanks", "nothing else"
    );
    private static final List<String> OPTIONAL_QUESTION_PHRASES = List.of(
            "anything else",
            "any other",
            "additional change",
            "more change",
            "other change",
            "other preference",
            "any preference",
            "should i proceed",
            "would you like me to proceed"
    );

    /**
     * Reconciles model output with established intent when the latest message
     * is a contextual confirmation rather than a standalone change request.
     */
    public void reconcile(
            ClarifierContext previousContext,
            ClarifierContext updatedContext,
            List<ClarifierConversationMessage> recentMessages,
            String latestUserMessage,
            ClarifierResponseDTO response
    ) {
        String normalizedReply = normalize(latestUserMessage);
        String previousAssistantMessage = lastAssistantMessage(recentMessages);
        boolean affirmative = AFFIRMATIVE_REPLIES.contains(normalizedReply);
        boolean negativeOptionalAnswer = NEGATIVE_REPLIES.contains(normalizedReply)
                && isOptionalQuestion(previousAssistantMessage);

        if ((!affirmative || !containsQuestion(previousAssistantMessage))
                && !negativeOptionalAnswer) {
            return;
        }

        preserveEstablishedContext(previousContext, updatedContext, negativeOptionalAnswer);
        removeAnsweredQuestions(previousContext, updatedContext);
        updatedContext.setConfidenceScore(Math.max(
                updatedContext.getConfidenceScore(),
                Math.min(1.0, previousContext.getConfidenceScore() + 0.15)
        ));

        if (!hasEstablishedIntent(updatedContext) || !updatedContext.getOpenQuestions().isEmpty()) {
            return;
        }

        response.setAdvancesRequest(true);
        response.setClarificationComplete(true);
        response.setReadyForPlanning(true);
    }

    private void preserveEstablishedContext(
            ClarifierContext previous,
            ClarifierContext updated,
            boolean restorePreviousIntent
    ) {
        if (restorePreviousIntent || isBlank(updated.getGlobalIntent())) {
            updated.setGlobalIntent(previous.getGlobalIntent());
        }
        if (restorePreviousIntent || isEmpty(updated.getSectionIntents())) {
            updated.setSectionIntents(previous.getSectionIntents());
        }
        if (restorePreviousIntent || isEmpty(updated.getTargetSectionKeys())) {
            updated.setTargetSectionKeys(previous.getTargetSectionKeys());
        }
        if (restorePreviousIntent || isUnknownScope(updated.getScope())) {
            updated.setScope(previous.getScope());
        }
        if (updated.getAssumptions() == null) {
            updated.setAssumptions(previous.getAssumptions());
        }
        if (updated.getConstraints() == null) {
            updated.setConstraints(previous.getConstraints());
        }
    }

    private void removeAnsweredQuestions(
            ClarifierContext previous,
            ClarifierContext updated
    ) {
        List<String> previousQuestions = previous.getOpenQuestions() == null
                ? List.of()
                : previous.getOpenQuestions();
        List<String> updatedQuestions = updated.getOpenQuestions() == null
                ? List.of()
                : updated.getOpenQuestions();
        List<String> remaining = new ArrayList<>();

        for (String question : updatedQuestions) {
            if (question == null
                    || isOptionalQuestion(question)
                    || containsNormalized(previousQuestions, question)) {
                continue;
            }
            remaining.add(question);
        }
        updated.setOpenQuestions(remaining);
    }

    private boolean containsNormalized(List<String> questions, String candidate) {
        String normalizedCandidate = normalize(candidate);
        return questions.stream()
                .filter(question -> question != null)
                .map(this::normalize)
                .anyMatch(normalizedCandidate::equals);
    }

    private boolean hasEstablishedIntent(ClarifierContext context) {
        return !isBlank(context.getGlobalIntent())
                && !isUnknownScope(context.getScope())
                && !isEmpty(context.getTargetSectionKeys());
    }

    private String lastAssistantMessage(List<ClarifierConversationMessage> messages) {
        if (messages == null) {
            return "";
        }
        for (int index = messages.size() - 1; index >= 0; index -= 1) {
            ClarifierConversationMessage message = messages.get(index);
            if (message != null
                    && message.role() == ClarifierConversationMessage.Role.ASSISTANT) {
                return message.content();
            }
        }
        return "";
    }

    private boolean containsQuestion(String message) {
        return message != null && message.contains("?");
    }

    private boolean isOptionalQuestion(String question) {
        String normalizedQuestion = normalize(question);
        return OPTIONAL_QUESTION_PHRASES.stream().anyMatch(normalizedQuestion::contains);
    }

    private boolean isUnknownScope(String scope) {
        return isBlank(scope) || "unknown".equalsIgnoreCase(scope);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isEmpty(List<?> values) {
        return values == null || values.isEmpty();
    }

    private boolean isEmpty(Map<?, ?> values) {
        return values == null || values.isEmpty();
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9' ]", " ")
                .replaceAll("\\s+", " ")
                .strip();
    }
}
