package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.SectionPlanDTO;
import com.webgen.webgen_backend.portfolio.entity.RefineChatMessage;
import com.webgen.webgen_backend.portfolio.model.clarifier.ChangeIntensity;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RefineChatTurnHistoryServiceTest {
    private final FakeRefineChatHistoryService historyService = new FakeRefineChatHistoryService();
    private final RefineChatTurnHistoryService service = new RefineChatTurnHistoryService(historyService);

    @Test
    void recordClarifierTurnAppendsUserAndAssistantMessages() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        historyService.history.add(message("existing"));

        ClarifierResponseDTO response = new ClarifierResponseDTO();
        response.setAssistantMessage("What should change in the hero?");
        response.setReadyForPlanning(false);

        service.recordClarifierTurn(userId, portfolioId, "Make the hero stronger", response);

        assertEquals(userId, historyService.savedUserId);
        assertEquals(portfolioId, historyService.savedPortfolioId);
        assertEquals(3, historyService.savedHistory.size());
        assertEquals("existing", historyService.savedHistory.get(0).getId());
        assertEquals("user", historyService.savedHistory.get(1).getRole());
        assertEquals("Make the hero stronger", historyService.savedHistory.get(1).getContent());
        assertEquals("clarify", historyService.savedHistory.get(1).getMessageType());
        assertEquals("ai", historyService.savedHistory.get(2).getRole());
        assertEquals("What should change in the hero?", historyService.savedHistory.get(2).getContent());
        assertFalse(historyService.savedHistory.get(2).getReadyForPlanning());
    }

    @Test
    void recordPlannerTurnAppendsPlanMessageWithSectionPlans() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();

        PlannerResponseDTO response = new PlannerResponseDTO();
        response.setPlanSummary("I will refine the hero.");
        response.setSectionPlans(List.of(sectionPlan()));

        service.recordPlannerTurn(userId, portfolioId, response);

        assertEquals(userId, historyService.savedUserId);
        assertEquals(portfolioId, historyService.savedPortfolioId);
        assertEquals(1, historyService.savedHistory.size());

        RefineChatMessage planMessage = historyService.savedHistory.getFirst();
        assertEquals("ai", planMessage.getRole());
        assertEquals("plan", planMessage.getMessageType());
        assertEquals("I will refine the hero.", planMessage.getPlanSummary());
        assertTrue(planMessage.getContent().contains("**Planned Changes:**"));
        assertTrue(planMessage.getContent().contains("- hero: Tighten the hero copy"));
        assertEquals(1, planMessage.getSectionPlans().size());
        assertEquals("hero", planMessage.getSectionPlans().getFirst().getSectionKey());
        assertEquals("MEDIUM", planMessage.getSectionPlans().getFirst().getIntensity());
    }

    private SectionPlanDTO sectionPlan() {
        SectionPlanDTO plan = new SectionPlanDTO();
        plan.setSectionKey("hero");
        plan.setAction("modify");
        plan.setInstruction("Tighten the hero copy");
        plan.setRationale("The intro should be clearer");
        plan.setIntensity(ChangeIntensity.MEDIUM);
        plan.setPreserveElements(List.of("headline"));
        return plan;
    }

    private RefineChatMessage message(String id) {
        return new RefineChatMessage(
                id,
                "ai",
                "Existing message",
                "2026-07-10T00:00:00.000Z",
                false,
                "clarify",
                false,
                new ArrayList<>(),
                null
        );
    }

    private static final class FakeRefineChatHistoryService implements RefineChatHistoryService {
        private final List<RefineChatMessage> history = new ArrayList<>();
        private UUID savedUserId;
        private UUID savedPortfolioId;
        private List<RefineChatMessage> savedHistory = new ArrayList<>();

        @Override
        public List<RefineChatMessage> loadHistory(UUID userId, UUID portfolioId) {
            return new ArrayList<>(history);
        }

        @Override
        public List<RefineChatMessage> saveHistory(
                UUID userId,
                UUID portfolioId,
                List<RefineChatMessage> history
        ) {
            savedUserId = userId;
            savedPortfolioId = portfolioId;
            savedHistory = new ArrayList<>(history);
            return savedHistory;
        }
    }
}
