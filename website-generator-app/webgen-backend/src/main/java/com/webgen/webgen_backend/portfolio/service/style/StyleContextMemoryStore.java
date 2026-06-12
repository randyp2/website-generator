package com.webgen.webgen_backend.portfolio.service.style;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import com.webgen.webgen_backend.agent.repository.AgentSessionRepository;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.model.style.StyleContext;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StyleContextMemoryStore {

    private static final String STYLE_CONTEXT_KEY = "styleContext";
    private static final int TOTAL_QUESTIONS = 10;

    private final AgentSessionRepository agentSessionRepository;
    private final PortfolioRepository portfolioRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public StyleContext load(UUID portfolioId) {
        AgentSession session = lockOrCreateActiveSession(portfolioId);
        JsonNode styleContextJson = session.getMemoryJson() == null
                ? null
                : session.getMemoryJson().get(STYLE_CONTEXT_KEY);

        if (styleContextJson == null || styleContextJson.isNull()) {
            return newContext();
        }

        try {
            StyleContext styleContext = objectMapper.treeToValue(styleContextJson, StyleContext.class);
            return styleContext == null ? newContext() : styleContext;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to deserialize style context from agent session memory", exception);
        }
    }

    @Transactional
    public void save(UUID portfolioId, StyleContext context) {
        AgentSession session = lockOrCreateActiveSession(portfolioId);
        AgentSession lockedSession = agentSessionRepository.findByIdForUpdate(session.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Active agent session disappeared during style context save"));

        ObjectNode memoryJson = lockedSession.getMemoryJson() != null && lockedSession.getMemoryJson().isObject()
                ? (ObjectNode) lockedSession.getMemoryJson().deepCopy()
                : objectMapper.createObjectNode();

        memoryJson.set(STYLE_CONTEXT_KEY, objectMapper.valueToTree(context == null ? newContext() : context));
        lockedSession.setMemoryJson(memoryJson);
        agentSessionRepository.save(lockedSession);
    }

    private AgentSession lockOrCreateActiveSession(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);

        try {
            return agentSessionRepository.saveAndFlush(newSession);
        } catch (DataIntegrityViolationException exception) {
            return agentSessionRepository
                    .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                    .flatMap(existing -> agentSessionRepository.findByIdForUpdate(existing.getId()))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Failed to create or recover active agent session",
                            exception));
        }
    }

    private StyleContext newContext() {
        StyleContext context = new StyleContext();
        context.setCurrentQuestionNumber(0);
        context.setTotalQuestions(TOTAL_QUESTIONS);
        context.setStyleDiscoveryComplete(false);
        context.setCurrentQuestion(null);
        context.setDesignGoal(null);
        context.setColorSelections(null);
        context.setConversationHistory(new ArrayList<>());
        context.setCompiledStylePreferences(null);
        context.setLastUserMessage(null);
        context.setInvalidAttemptsForCurrentQuestion(0);
        context.setFontSelections(null);
        context.setTypographyPickerShown(false);
        context.setLayoutSelection(null);
        return context;
    }
}
