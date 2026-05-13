package com.webgen.webgen_backend.agent.service.impl;

import com.webgen.webgen_backend.agent.dto.AgentTurnResultDTO;
import com.webgen.webgen_backend.agent.entity.AgentMessage;
import com.webgen.webgen_backend.agent.entity.AgentMessageRole;
import com.webgen.webgen_backend.agent.entity.AgentRun;
import com.webgen.webgen_backend.agent.entity.AgentRunStatus;
import com.webgen.webgen_backend.agent.entity.AgentSession;
import com.webgen.webgen_backend.agent.entity.AgentSessionStage;
import com.webgen.webgen_backend.agent.entity.AgentSessionStatus;
import com.webgen.webgen_backend.agent.repository.AgentMessageRepository;
import com.webgen.webgen_backend.agent.repository.AgentRunRepository;
import com.webgen.webgen_backend.agent.repository.AgentSessionRepository;
import com.webgen.webgen_backend.agent.service.AgentOrchestratorService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentOrchestratorServiceImpl implements AgentOrchestratorService {

    private final PortfolioRepository portfolioRepository;
    private final AgentSessionRepository agentSessionRepository;
    private final AgentMessageRepository agentMessageRepository;
    private final AgentRunRepository agentRunRepository;

    @Override
    @Transactional
    public AgentTurnResultDTO processTurn(UUID userId, UUID portfolioId, String userMessage) {
        // --- Validate input
        String normalizedUserMessage = validateAndNormalizeUserMessage(userId, portfolioId, userMessage);

        // --- Upsert to DB: verify ownership and acquire active session
        Portfolio ownedPortfolio = loadOwnedPortfolio(userId, portfolioId);
        AgentSession activeSession = lockOrCreateActiveSession(ownedPortfolio);

        // --- Upsert to DB: append user message and open run
        long userSequenceNo = agentMessageRepository.nextSequenceNo(activeSession.getId());
        AgentMessage persistedUserMessage = appendMessage(
                activeSession.getId(),
                userSequenceNo,
                AgentMessageRole.USER,
                normalizedUserMessage,
                null,
                null);

        // --- Update the run row
        AgentRun run = startRun(activeSession.getId(), persistedUserMessage.getId());

        // --- Build assistant response
        String assistantReply = buildAssistantReply(activeSession, normalizedUserMessage);

        // --- Upsert to DB: append assistant message and finalize turn state
        AgentMessage persistedAssistantMessage = appendMessage(
                activeSession.getId(),
                userSequenceNo + 1,
                AgentMessageRole.ASSISTANT,
                assistantReply,
                null,
                null);

        completeRun(run, persistedAssistantMessage.getId());
        touchSession(activeSession);

        return AgentTurnResultDTO.builder()
                .sessionId(activeSession.getId())
                .runId(run.getId())
                .userMessageId(persistedUserMessage.getId())
                .assistantMessageId(persistedAssistantMessage.getId())
                .runStatus(run.getStatus())
                .sessionStage(activeSession.getStage())
                .assistantMessage(assistantReply)
                .completedAt(run.getFinishedAt())
                .build();
    }

    /**
     * Validates required turn inputs and returns a normalized user message.
     */
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

    /**
     * Loads a portfolio and enforces ownership for the authenticated user.
     */
    private Portfolio loadOwnedPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!userId.equals(portfolio.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this portfolio");
        }

        return portfolio;
    }

    /**
     * Retrieves the active session for a portfolio with a write lock, or creates
     * one.
     */
    private AgentSession lockOrCreateActiveSession(Portfolio portfolio) {
        return agentSessionRepository
                .findByPortfolioIdAndStatus(portfolio.getId(), AgentSessionStatus.ACTIVE)
                .map(existing -> agentSessionRepository.findByIdForUpdate(existing.getId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Active agent session disappeared during lock acquisition")))
                .orElseGet(() -> createActiveSessionWithRaceRecovery(portfolio));
    }

    /**
     * Creates a new active session and retries read path if a concurrent insert
     * wins.
     */
    private AgentSession createActiveSessionWithRaceRecovery(Portfolio portfolio) {
        AgentSession newSession = new AgentSession();
        newSession.setPortfolioId(portfolio.getId());
        newSession.setUserId(portfolio.getUserId());
        newSession.setStatus(AgentSessionStatus.ACTIVE);
        newSession.setStage(AgentSessionStage.DISCOVERY);
        newSession.setCurrentJobId(null);

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

    /**
     * Persists a single message row for the session timeline.
     */
    private AgentMessage appendMessage(
            UUID sessionId,
            long sequenceNo,
            AgentMessageRole role,
            String content,
            String toolName,
            String toolCallId) {
        AgentMessage message = new AgentMessage();
        message.setSessionId(sessionId);
        message.setSequenceNo(sequenceNo);
        message.setRole(role);
        message.setContent(content);
        message.setToolName(toolName);
        message.setToolCallId(toolCallId);
        return agentMessageRepository.save(message);
    }

    /**
     * Creates a running agent run row for the current user message.
     */
    private AgentRun startRun(UUID sessionId, UUID userMessageId) {
        AgentRun run = new AgentRun();
        run.setSessionId(sessionId);
        run.setUserMessageId(userMessageId);
        run.setStatus(AgentRunStatus.RUNNING);
        return agentRunRepository.save(run);
    }

    /**
     * Builds a temporary assistant reply until the model client is wired.
     */
    private String buildAssistantReply(AgentSession session, String userMessage) {
        return "I received your request and recorded it in the agent session. "
                + "AI orchestration tools are not wired yet for stage "
                + session.getStage()
                + ". Latest message: "
                + userMessage;
    }

    /**
     * Finalizes the run with an assistant message and completion metadata.
     */
    private void completeRun(AgentRun run, UUID assistantMessageId) {
        OffsetDateTime finishedAt = OffsetDateTime.now();
        run.setAssistantMessageId(assistantMessageId);
        run.setStatus(AgentRunStatus.COMPLETED);
        run.setFinishedAt(finishedAt);
        if (run.getStartedAt() != null) {
            run.setDurationMs(finishedAt.toInstant().toEpochMilli() - run.getStartedAt().toInstant().toEpochMilli());
        }
        agentRunRepository.save(run);
    }

    /**
     * Updates session activity timestamps after a successful turn.
     */
    private void touchSession(AgentSession session) {
        OffsetDateTime now = OffsetDateTime.now();
        session.setLastActivityAt(now);
        session.setUpdatedAt(now);
        agentSessionRepository.save(session);
    }
}
