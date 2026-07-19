package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.entity.PortfolioRefinementSession;
import com.webgen.webgen_backend.portfolio.exception.RefineSessionExpiredException;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRefinementSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** Coordinates one bounded credit reservation across a portfolio refinement workflow. */
@Service
@RequiredArgsConstructor
public class RefinementSessionService {

    static final int MAX_AI_TURNS = 8;
    private static final int MAX_CLARIFIER_TURNS = MAX_AI_TURNS - 1;
    private static final Duration SESSION_LIFETIME = Duration.ofMinutes(30);

    private final PortfolioRefinementSessionRepository sessionRepository;
    private final CreditGuardService creditGuardService;

    /**
     * Starts a clarifier turn, creating and charging a new session when no id is supplied.
     *
     * @return durable server session id that must be used by later workflow stages
     */
    @Transactional
    public UUID beginClarifierTurn(
            UUID profileId,
            UUID portfolioId,
            String requestedSessionId
    ) {
        if (requestedSessionId == null || requestedSessionId.isBlank()) {
            return createSession(profileId, portfolioId);
        }

        PortfolioRefinementSession session = lockActiveSession(
                requestedSessionId,
                profileId,
                portfolioId
        );
        beginAiTurn(session, MAX_CLARIFIER_TURNS);
        session.setPlanCompleted(false);
        return session.getId();
    }

    /** Starts a planner turn within an already charged refinement session. */
    @Transactional
    public void beginPlannerTurn(UUID profileId, UUID portfolioId, String sessionId) {
        PortfolioRefinementSession session = lockActiveSession(sessionId, profileId, portfolioId);
        if (!session.isHasSuccessfulResponse()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Complete a clarification turn before planning"
            );
        }
        beginAiTurn(session, MAX_AI_TURNS);
        session.setPlanCompleted(false);
    }

    /** Marks a successful clarifier response while retaining the session charge. */
    @Transactional
    public void completeClarifierTurn(UUID profileId, UUID portfolioId, String sessionId) {
        PortfolioRefinementSession session = lockOwnedSession(sessionId, profileId, portfolioId);
        completeAiTurn(session);
    }

    /** Marks a successful planner response and permits the build stage. */
    @Transactional
    public void completePlannerTurn(UUID profileId, UUID portfolioId, String sessionId) {
        PortfolioRefinementSession session = lockOwnedSession(sessionId, profileId, portfolioId);
        completeAiTurn(session);
        session.setPlanCompleted(true);
    }

    /**
     * Releases a failed turn. Only a session whose first AI call never succeeded is refunded.
     */
    @Transactional
    public void failAiTurn(
            UUID profileId,
            UUID portfolioId,
            String sessionId,
            String failureReason
    ) {
        PortfolioRefinementSession session = lockOwnedSession(sessionId, profileId, portfolioId);
        if (!session.isHasSuccessfulResponse()) {
            if (session.getUsageReservationId() != null) {
                creditGuardService.refundCredits(session.getUsageReservationId(), failureReason);
            }
            sessionRepository.delete(session);
            return;
        }

        session.setTurnInProgress(false);
        session.setUpdatedAt(now());
    }

    /** Closes a planned session to further AI turns before its build is queued. */
    @Transactional
    public void beginBuild(UUID profileId, UUID portfolioId, String sessionId) {
        PortfolioRefinementSession session = lockActiveSession(sessionId, profileId, portfolioId);
        if (session.isTurnInProgress() || !session.isPlanCompleted()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Complete refinement planning before building"
            );
        }
        if (session.isBuildStarted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Refinement build already started");
        }

        session.setBuildStarted(true);
        session.setUpdatedAt(now());
    }

    /** Reopens the build stage when validation or queue submission fails synchronously. */
    @Transactional
    public void failBuild(UUID profileId, UUID portfolioId, String sessionId) {
        PortfolioRefinementSession session = lockOwnedSession(sessionId, profileId, portfolioId);
        session.setBuildStarted(false);
        session.setUpdatedAt(now());
    }

    private UUID createSession(UUID profileId, UUID portfolioId) {
        OffsetDateTime createdAt = now();
        UUID reservationId = creditGuardService.reserveUsage(
                profileId,
                PortfolioCreditCostPolicy.REFINEMENT_SESSION_USAGE
        ).orElse(null);

        PortfolioRefinementSession session = new PortfolioRefinementSession();
        session.setId(UUID.randomUUID());
        session.setProfileId(profileId);
        session.setPortfolioId(portfolioId);
        session.setUsageReservationId(reservationId);
        session.setAiTurnCount(1);
        session.setHasSuccessfulResponse(false);
        session.setPlanCompleted(false);
        session.setTurnInProgress(true);
        session.setBuildStarted(false);
        session.setExpiresAt(createdAt.plus(SESSION_LIFETIME));
        session.setCreatedAt(createdAt);
        session.setUpdatedAt(createdAt);
        sessionRepository.save(session);
        return session.getId();
    }

    private void beginAiTurn(PortfolioRefinementSession session, int maximumTurns) {
        if (session.isTurnInProgress()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another refinement request is already running"
            );
        }
        if (session.isBuildStarted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Refinement build already started");
        }
        if (session.getAiTurnCount() >= maximumTurns) {
            throw new RefineSessionExpiredException(
                    "This refinement session reached its interaction limit. "
                            + "Please start a new refinement."
            );
        }

        session.setAiTurnCount(session.getAiTurnCount() + 1);
        session.setTurnInProgress(true);
        session.setUpdatedAt(now());
    }

    private void completeAiTurn(PortfolioRefinementSession session) {
        if (!session.isTurnInProgress()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No refinement turn is running");
        }
        session.setHasSuccessfulResponse(true);
        session.setTurnInProgress(false);
        session.setUpdatedAt(now());
    }

    private PortfolioRefinementSession lockActiveSession(
            String sessionId,
            UUID profileId,
            UUID portfolioId
    ) {
        PortfolioRefinementSession session = lockOwnedSession(sessionId, profileId, portfolioId);
        if (!session.getExpiresAt().isAfter(now())) {
            throw new RefineSessionExpiredException();
        }
        return session;
    }

    private PortfolioRefinementSession lockOwnedSession(
            String sessionId,
            UUID profileId,
            UUID portfolioId
    ) {
        UUID parsedSessionId = parseSessionId(sessionId);
        PortfolioRefinementSession session = sessionRepository.findByIdForUpdate(parsedSessionId)
                .orElseThrow(RefineSessionExpiredException::new);
        if (!session.getProfileId().equals(profileId)
                || !session.getPortfolioId().equals(portfolioId)) {
            throw new RefineSessionExpiredException();
        }
        return session;
    }

    private UUID parseSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new RefineSessionExpiredException();
        }
        try {
            return UUID.fromString(sessionId);
        } catch (IllegalArgumentException invalidSessionId) {
            throw new RefineSessionExpiredException();
        }
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
