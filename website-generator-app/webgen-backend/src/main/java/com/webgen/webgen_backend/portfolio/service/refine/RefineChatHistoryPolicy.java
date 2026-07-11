package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.entity.RefineChatSectionPlan;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Normalizes and bounds persisted refine chat history.
 */
@Component
public class RefineChatHistoryPolicy {
    private static final int MAX_MESSAGES = 200;

    /**
     * Returns a bounded, null-safe copy of refine chat history.
     *
     * @param history raw history from persistence or API input
     * @return normalized copy preserving chronological order
     */
    public List<RefineChatMessage> normalize(List<RefineChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return new ArrayList<>();
        }

        int startIndex = Math.max(0, history.size() - MAX_MESSAGES);
        List<RefineChatMessage> normalized = new ArrayList<>();

        for (int index = startIndex; index < history.size(); index += 1) {
            RefineChatMessage message = history.get(index);
            if (message != null) {
                normalized.add(copyMessage(message));
            }
        }

        return normalized;
    }

    private RefineChatMessage copyMessage(RefineChatMessage message) {
        return new RefineChatMessage(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getTimestamp(),
                message.getIsGenerating(),
                message.getMessageType(),
                message.getReadyForPlanning(),
                copySectionPlans(message.getSectionPlans()),
                message.getPlanSummary(),
                message.getFlowStateDurationSeconds()
        );
    }

    private List<RefineChatSectionPlan> copySectionPlans(List<RefineChatSectionPlan> plans) {
        if (plans == null || plans.isEmpty()) {
            return new ArrayList<>();
        }

        List<RefineChatSectionPlan> copies = new ArrayList<>();
        for (RefineChatSectionPlan plan : plans) {
            if (plan != null) {
                copies.add(copySectionPlan(plan));
            }
        }
        return copies;
    }

    private RefineChatSectionPlan copySectionPlan(RefineChatSectionPlan plan) {
        return new RefineChatSectionPlan(
                plan.getSectionKey(),
                plan.getAction(),
                plan.getInstruction(),
                plan.getRationale(),
                plan.getIntensity(),
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
}
