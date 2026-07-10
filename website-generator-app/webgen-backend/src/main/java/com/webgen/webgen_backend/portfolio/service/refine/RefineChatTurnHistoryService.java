package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.entity.RefineChatSectionPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Records durable refine chat entries created by a successful refine turn.
 */
@Service
@RequiredArgsConstructor
public class RefineChatTurnHistoryService {
    private final RefineChatHistoryService refineChatHistoryService;

    /**
     * Appends the user prompt and clarifier response for a refine chat turn.
     *
     * @param userId authenticated portfolio owner id
     * @param portfolioId portfolio id whose history should be updated
     * @param userPrompt prompt submitted by the user
     * @param response successful clarifier response
     */
    public void recordClarifierTurn(
            UUID userId,
            UUID portfolioId,
            String userPrompt,
            ClarifierResponseDTO response
    ) {
        List<RefineChatMessage> history = refineChatHistoryService.loadHistory(userId, portfolioId);
        history.add(userMessage(userPrompt, "clarify"));
        history.add(clarifierMessage(response));

        refineChatHistoryService.saveHistory(userId, portfolioId, history);
    }

    /**
     * Appends the planned changes shown to the user for approval.
     *
     * @param userId authenticated portfolio owner id
     * @param portfolioId portfolio id whose history should be updated
     * @param response successful planner response
     */
    public void recordPlannerTurn(
            UUID userId,
            UUID portfolioId,
            PlannerResponseDTO response
    ) {
        List<RefineChatMessage> history = refineChatHistoryService.loadHistory(userId, portfolioId);
        history.add(planMessage(response));

        refineChatHistoryService.saveHistory(userId, portfolioId, history);
    }

    private RefineChatMessage userMessage(String content, String messageType) {
        return new RefineChatMessage(
                messageId("user"),
                "user",
                content,
                Instant.now().toString(),
                false,
                messageType,
                null,
                new ArrayList<>(),
                null
        );
    }

    private RefineChatMessage clarifierMessage(ClarifierResponseDTO response) {
        String content = response.getAssistantMessage();
        if (content == null || content.isBlank()) {
            content = "Thanks. I can help clarify that. What would you like to change?";
        }

        return new RefineChatMessage(
                messageId("ai-clarify"),
                "ai",
                content,
                Instant.now().toString(),
                false,
                "clarify",
                response.isReadyForPlanning(),
                new ArrayList<>(),
                null
        );
    }

    private RefineChatMessage planMessage(PlannerResponseDTO response) {
        List<RefineChatSectionPlan> sectionPlans = toPersistedSectionPlans(response.getSectionPlans());
        String planSummary = response.getPlanSummary();

        return new RefineChatMessage(
                messageId("ai-plan"),
                "ai",
                buildPlanContent(planSummary, sectionPlans),
                Instant.now().toString(),
                false,
                "plan",
                null,
                sectionPlans,
                planSummary
        );
    }

    private String buildPlanContent(
            String planSummary,
            List<RefineChatSectionPlan> sectionPlans
    ) {
        StringBuilder content = new StringBuilder();
        content.append(planSummary == null || planSummary.isBlank()
                ? "I created a modification plan."
                : planSummary);

        List<String> plannedChanges = sectionPlans.stream()
                .filter(plan -> "modify".equals(plan.getAction()) || "add".equals(plan.getAction()))
                .map(plan -> "- " + plan.getSectionKey() + ": " + plan.getInstruction())
                .toList();

        if (!plannedChanges.isEmpty()) {
            content.append("\n\n**Planned Changes:**\n");
            content.append(String.join("\n", plannedChanges));
        }

        content.append("\n\n_Use the buttons below to apply these changes, or keep chatting to adjust._");
        return content.toString();
    }

    private List<RefineChatSectionPlan> toPersistedSectionPlans(List<SectionPlanDTO> sectionPlans) {
        if (sectionPlans == null || sectionPlans.isEmpty()) {
            return new ArrayList<>();
        }

        List<RefineChatSectionPlan> persistedPlans = new ArrayList<>();
        for (SectionPlanDTO plan : sectionPlans) {
            if (plan != null) {
                persistedPlans.add(toPersistedSectionPlan(plan));
            }
        }

        return persistedPlans;
    }

    private RefineChatSectionPlan toPersistedSectionPlan(SectionPlanDTO plan) {
        return new RefineChatSectionPlan(
                plan.getSectionKey(),
                plan.getAction(),
                plan.getInstruction(),
                plan.getRationale(),
                plan.getIntensity() == null ? null : plan.getIntensity().name(),
                copyStrings(plan.getPreserveElements()),
                plan.getNewSectionTitle(),
                plan.getInsertAfterSectionKey(),
                plan.getOrderIndex()
        );
    }

    private List<String> copyStrings(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> copies = new ArrayList<>();
        for (String value : values) {
            if (value != null) {
                copies.add(value);
            }
        }
        return copies;
    }

    private String messageId(String prefix) {
        return "refine-" + prefix + "-" + UUID.randomUUID();
    }
}
