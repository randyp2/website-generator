package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.dto.AgentChatTurnResponseDTO;
import com.webgen.webgen_backend.agent.dto.AgentMessageDTO;
import com.webgen.webgen_backend.agent.dto.AgentStructuredPlanDTO;
import com.webgen.webgen_backend.agent.dto.AgentToolCallDTO;
import com.webgen.webgen_backend.agent.service.ai.AgentAiRequest;
import com.webgen.webgen_backend.agent.service.ai.AgentAiResponse;
import com.webgen.webgen_backend.agent.service.ai.AgentAiClient;
import com.webgen.webgen_backend.agent.service.AgentOrchestratorService;
import com.webgen.webgen_backend.agent.service.AgentPromptBuilder;
import com.webgen.webgen_backend.agent.service.AgentTurnContext;
import com.webgen.webgen_backend.agent.service.AgentTurnPersistenceService;
import com.webgen.webgen_backend.agent.service.parser.AgentResponseParser;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutionResult;
import com.webgen.webgen_backend.agent.tools.AgentToolExecutor;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentOrchestratorServiceImpl implements AgentOrchestratorService {

    private final AgentTurnPersistenceService persistenceService;

    private final AgentPromptBuilder agentPromptBuilder;
    private final AgentAiClient agentAiClient;
    private final AgentResponseParser agentResponseParser;
    private final AgentToolExecutor agentToolExecutor;

    @Override
    public AgentChatTurnResponseDTO processTurn(UUID userId, UUID portfolioId, String userMessage) {
        String normalizedUserMessage = validateAndNormalizeUserMessage(userId, portfolioId, userMessage);
        AgentTurnContext turnContext = persistenceService.startTurn(userId, portfolioId, normalizedUserMessage);

        try {
            Prompt prompt = agentPromptBuilder.buildTurnPrompt(
                    turnContext.session(),
                    turnContext.history(),
                    normalizedUserMessage);

            AgentAiResponse plannerResponse = agentAiClient.call(new AgentAiRequest(prompt));
            AgentStructuredPlanDTO structuredPlan = agentResponseParser.parseStructuredPlan(plannerResponse);

            List<AgentToolExecutionResult> toolResults = agentToolExecutor.execute(
                    turnContext.portfolio().getId(),
                    structuredPlan.getToolRequests());
            String assistantText = structuredPlan.getAssistantMessage();
            AgentAiResponse synthesisResponse = null;
            if (shouldSynthesize(toolResults)) {
                synthesisResponse = callSynthesis(turnContext, normalizedUserMessage, structuredPlan, toolResults);
                AgentStructuredPlanDTO synthesisPlan = safeParseSynthesis(synthesisResponse);
                if (synthesisPlan != null) {
                    assistantText = synthesisPlan.getAssistantMessage();
                }
            }
            structuredPlan.setAssistantMessage(assistantText);

            AgentMessageDTO assistantMessage = persistenceService.completeTurn(
                    turnContext.session().getId(),
                    turnContext.run().getId(),
                    structuredPlan,
                    assistantText,
                    toolResults,
                    plannerResponse,
                    prompt);

            return AgentChatTurnResponseDTO.builder()
                    .sessionId(turnContext.session().getId())
                    .runId(turnContext.run().getId())
                    .assistantMessage(assistantMessage)
                    .structuredResponse(structuredPlan)
                    .toolCalls(toolResults.stream()
                            .map(AgentToolCallDTO::fromExecutionResult)
                            .toList())
                    .build();
        } catch (RuntimeException exception) {
            persistenceService.failRun(turnContext.run().getId(), exception);
            throw exception;
        }
    }

    private String validateAndNormalizeUserMessage(UUID userId, UUID portfolioId, String userMessage) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        if (portfolioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "portfolioId is required");
        }
        if (userMessage == null || userMessage.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userMessage is required");
        }

        String normalized = userMessage.trim();
        if (normalized.length() > 4000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userMessage exceeds maximum length");
        }
        return normalized;
    }

    private boolean shouldSynthesize(List<AgentToolExecutionResult> toolResults) {
        return toolResults != null && toolResults.stream().anyMatch(AgentToolExecutionResult::isFeedsSynthesis);
    }

    private AgentAiResponse callSynthesis(
            AgentTurnContext turnContext,
            String userMessage,
            AgentStructuredPlanDTO structuredPlan,
            List<AgentToolExecutionResult> toolResults) {
        try {
            Prompt synthesisPrompt = agentPromptBuilder.buildSynthesisPrompt(
                    turnContext.session(),
                    userMessage,
                    structuredPlan,
                    toolResults);
            return agentAiClient.call(new AgentAiRequest(synthesisPrompt));
        } catch (RuntimeException exception) {
            System.out.println(">>> [AGENT_ORCHESTRATOR] synthesis call failed: " + exception.getMessage());
            return null;
        }
    }

    private AgentStructuredPlanDTO safeParseSynthesis(AgentAiResponse synthesisResponse) {
        if (synthesisResponse == null) {
            return null;
        }
        try {
            return agentResponseParser.parseStructuredPlan(synthesisResponse);
        } catch (RuntimeException exception) {
            System.out.println(">>> [AGENT_ORCHESTRATOR] synthesis parse failed: " + exception.getMessage());
            return null;
        }
    }
}
