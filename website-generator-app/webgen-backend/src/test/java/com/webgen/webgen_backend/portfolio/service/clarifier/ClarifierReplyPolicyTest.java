package com.webgen.webgen_backend.portfolio.service.clarifier;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConstraints;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierContext;
import com.webgen.webgen_backend.portfolio.model.clarifier.ClarifierConversationMessage;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClarifierReplyPolicyTest {
    private final ClarifierReplyPolicy policy = new ClarifierReplyPolicy();

    @Test
    void affirmativeReplyCompletesEstablishedRequestWithoutOptionalFollowUp() {
        ClarifierContext previous = establishedContext();
        previous.setConfidenceScore(0.60);
        previous.setOpenQuestions(List.of("Use exactly 'risk taker' or different phrasing?"));

        ClarifierContext updated = establishedContext();
        updated.setConfidenceScore(0.60);
        updated.setOpenQuestions(List.of("Is there anything else you would like to update?"));
        ClarifierResponseDTO response = incompleteResponse();

        policy.reconcile(
                previous,
                updated,
                List.of(new ClarifierConversationMessage(
                        ClarifierConversationMessage.Role.ASSISTANT,
                        "Would you like the new tagline to be exactly 'risk taker' in italics?"
                )),
                "yup",
                response
        );

        assertThat(updated.getOpenQuestions()).isEmpty();
        assertThat(updated.getConfidenceScore()).isGreaterThanOrEqualTo(0.75);
        assertThat(response.isAdvancesRequest()).isTrue();
        assertThat(response.isClarificationComplete()).isTrue();
        assertThat(response.isReadyForPlanning()).isTrue();
    }

    @Test
    void negativeReplyToAnythingElsePreservesConfirmedIntentAndCompletes() {
        ClarifierContext previous = establishedContext();
        previous.setConfidenceScore(0.80);
        previous.setOpenQuestions(List.of("Anything else to update?"));

        ClarifierContext updated = emptyContext();
        updated.setOpenQuestions(List.of("Should I proceed with the tagline update?"));
        ClarifierResponseDTO response = incompleteResponse();

        policy.reconcile(
                previous,
                updated,
                List.of(new ClarifierConversationMessage(
                        ClarifierConversationMessage.Role.ASSISTANT,
                        "Great, I will update the hero tagline. Is there anything else?"
                )),
                "nope",
                response
        );

        assertThat(updated.getGlobalIntent()).isEqualTo(previous.getGlobalIntent());
        assertThat(updated.getTargetSectionKeys()).containsExactly("hero");
        assertThat(updated.getOpenQuestions()).isEmpty();
        assertThat(response.isReadyForPlanning()).isTrue();
    }

    @Test
    void negativeReplyToCriticalQuestionDoesNotForcePlanning() {
        ClarifierContext previous = establishedContext();
        ClarifierContext updated = establishedContext();
        ClarifierResponseDTO response = incompleteResponse();

        policy.reconcile(
                previous,
                updated,
                List.of(new ClarifierConversationMessage(
                        ClarifierConversationMessage.Role.ASSISTANT,
                        "Should I delete the hero section?"
                )),
                "nope",
                response
        );

        assertThat(response.isReadyForPlanning()).isFalse();
        assertThat(response.isClarificationComplete()).isFalse();
    }

    private ClarifierContext establishedContext() {
        ClarifierContext context = emptyContext();
        context.setGlobalIntent("Replace the hero tagline with 'risk taker' and italicize it");
        context.setSectionIntents(new HashMap<>(java.util.Map.of(
                "hero",
                "Replace and italicize the tagline"
        )));
        context.setTargetSectionKeys(new ArrayList<>(List.of("hero")));
        context.setScope("section");
        return context;
    }

    private ClarifierContext emptyContext() {
        ClarifierContext context = new ClarifierContext();
        context.setGlobalIntent("");
        context.setSectionIntents(new HashMap<>());
        context.setTargetSectionKeys(new ArrayList<>());
        context.setScope("unknown");
        context.setOpenQuestions(new ArrayList<>());
        context.setAssumptions(new ArrayList<>());
        context.setConstraints(new ClarifierConstraints());
        return context;
    }

    private ClarifierResponseDTO incompleteResponse() {
        ClarifierResponseDTO response = new ClarifierResponseDTO();
        response.setAdvancesRequest(false);
        response.setClarificationComplete(false);
        response.setReadyForPlanning(false);
        return response;
    }
}
