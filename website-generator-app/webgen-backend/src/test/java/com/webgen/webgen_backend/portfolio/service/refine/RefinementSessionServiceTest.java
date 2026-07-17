package com.webgen.webgen_backend.portfolio.service.refine;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.entity.PortfolioRefinementSession;
import com.webgen.webgen_backend.portfolio.exception.RefineSessionExpiredException;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRefinementSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RefinementSessionServiceTest {

    private RepositoryState repositoryState;
    private RecordingCreditGuard creditGuard;
    private RefinementSessionService service;
    private UUID profileId;
    private UUID portfolioId;

    @BeforeEach
    void setUp() {
        repositoryState = new RepositoryState();
        creditGuard = new RecordingCreditGuard();
        service = new RefinementSessionService(repository(repositoryState), creditGuard);
        profileId = UUID.randomUUID();
        portfolioId = UUID.randomUUID();
    }

    @Test
    void newSessionReservesOneRefinementUsageAndStartsFirstTurn() {
        UUID sessionId = service.beginClarifierTurn(profileId, portfolioId, null);

        PortfolioRefinementSession session = repositoryState.sessions.get(sessionId);
        assertThat(session.getProfileId()).isEqualTo(profileId);
        assertThat(session.getPortfolioId()).isEqualTo(portfolioId);
        assertThat(session.getUsageReservationId()).isEqualTo(creditGuard.reservationId);
        assertThat(session.getAiTurnCount()).isEqualTo(1);
        assertThat(session.isTurnInProgress()).isTrue();
        assertThat(session.isHasSuccessfulResponse()).isFalse();
        assertThat(session.getExpiresAt()).isAfter(session.getCreatedAt());
        assertThat(creditGuard.reserveCount).isEqualTo(1);
        assertThat(creditGuard.allowanceBucket).isEqualTo(CreditBucket.PORTFOLIO_REFINEMENT);
        assertThat(creditGuard.fallbackCredits).isEqualTo(9);
        assertThat(creditGuard.operationCode).isEqualTo("portfolio_refinement");
    }

    @Test
    void oneReservationCoversClarifierPlannerAndBuild() {
        UUID sessionId = service.beginClarifierTurn(profileId, portfolioId, null);
        PortfolioRefinementSession session = repositoryState.sessions.get(sessionId);

        service.completeClarifierTurn(profileId, portfolioId, sessionId.toString());
        service.beginPlannerTurn(profileId, portfolioId, sessionId.toString());
        service.completePlannerTurn(profileId, portfolioId, sessionId.toString());
        service.beginBuild(profileId, portfolioId, sessionId.toString());

        assertThat(creditGuard.reserveCount).isEqualTo(1);
        assertThat(session.getAiTurnCount()).isEqualTo(2);
        assertThat(session.isHasSuccessfulResponse()).isTrue();
        assertThat(session.isPlanCompleted()).isTrue();
        assertThat(session.isBuildStarted()).isTrue();
    }

    @Test
    void failedFirstAiTurnRefundsAndClosesSession() {
        UUID sessionId = service.beginClarifierTurn(profileId, portfolioId, null);

        service.failAiTurn(
                profileId,
                portfolioId,
                sessionId.toString(),
                "OpenAiException"
        );

        assertThat(creditGuard.refundedReservationId).isEqualTo(creditGuard.reservationId);
        assertThat(creditGuard.failureReason).isEqualTo("OpenAiException");
        assertThat(repositoryState.sessions).doesNotContainKey(sessionId);
    }

    @Test
    void laterFailedTurnCountsTowardLimitWithoutRefundingSession() {
        PortfolioRefinementSession session = activeSession(3);
        session.setHasSuccessfulResponse(true);
        session.setTurnInProgress(true);
        repositoryState.sessions.put(session.getId(), session);

        service.failAiTurn(
                profileId,
                portfolioId,
                session.getId().toString(),
                "PlannerException"
        );

        assertThat(creditGuard.refundedReservationId).isNull();
        assertThat(repositoryState.sessions).containsKey(session.getId());
        assertThat(session.getAiTurnCount()).isEqualTo(3);
        assertThat(session.isTurnInProgress()).isFalse();
    }

    @Test
    void reservesTheEighthAiTurnForPlanning() {
        PortfolioRefinementSession session = activeSession(RefinementSessionService.MAX_AI_TURNS - 1);
        session.setHasSuccessfulResponse(true);
        repositoryState.sessions.put(session.getId(), session);

        assertThatThrownBy(() -> service.beginClarifierTurn(
                profileId,
                portfolioId,
                session.getId().toString()
        )).isInstanceOf(RefineSessionExpiredException.class);

        service.beginPlannerTurn(profileId, portfolioId, session.getId().toString());
        assertThat(session.getAiTurnCount()).isEqualTo(RefinementSessionService.MAX_AI_TURNS);
        assertThat(session.isTurnInProgress()).isTrue();
    }

    @Test
    void rejectsExpiredOrMismatchedSessionsWithoutLeakingOwnership() {
        PortfolioRefinementSession expired = activeSession(1);
        expired.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(1));
        repositoryState.sessions.put(expired.getId(), expired);

        assertThatThrownBy(() -> service.beginPlannerTurn(
                profileId,
                portfolioId,
                expired.getId().toString()
        )).isInstanceOf(RefineSessionExpiredException.class);

        PortfolioRefinementSession otherUserSession = activeSession(1);
        otherUserSession.setProfileId(UUID.randomUUID());
        repositoryState.sessions.put(otherUserSession.getId(), otherUserSession);

        assertThatThrownBy(() -> service.beginPlannerTurn(
                profileId,
                portfolioId,
                otherUserSession.getId().toString()
        )).isInstanceOf(RefineSessionExpiredException.class);
    }

    private PortfolioRefinementSession activeSession(int aiTurnCount) {
        OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        PortfolioRefinementSession session = new PortfolioRefinementSession();
        session.setId(UUID.randomUUID());
        session.setProfileId(profileId);
        session.setPortfolioId(portfolioId);
        session.setUsageReservationId(UUID.randomUUID());
        session.setAiTurnCount(aiTurnCount);
        session.setHasSuccessfulResponse(false);
        session.setPlanCompleted(false);
        session.setTurnInProgress(false);
        session.setBuildStarted(false);
        session.setCreatedAt(createdAt);
        session.setUpdatedAt(createdAt);
        session.setExpiresAt(createdAt.plusMinutes(30));
        return session;
    }

    private PortfolioRefinementSessionRepository repository(RepositoryState state) {
        return (PortfolioRefinementSessionRepository) Proxy.newProxyInstance(
                PortfolioRefinementSessionRepository.class.getClassLoader(),
                new Class<?>[]{PortfolioRefinementSessionRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        PortfolioRefinementSession session = (PortfolioRefinementSession) args[0];
                        state.sessions.put(session.getId(), session);
                        yield session;
                    }
                    case "findByIdForUpdate" -> Optional.ofNullable(state.sessions.get(args[0]));
                    case "delete" -> {
                        PortfolioRefinementSession session = (PortfolioRefinementSession) args[0];
                        state.sessions.remove(session.getId());
                        yield null;
                    }
                    case "toString" -> "PortfolioRefinementSessionRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private static final class RepositoryState {
        private final Map<UUID, PortfolioRefinementSession> sessions = new HashMap<>();
    }

    private static final class RecordingCreditGuard implements CreditGuardService {
        private final UUID reservationId = UUID.randomUUID();
        private int reserveCount;
        private CreditBucket allowanceBucket;
        private int fallbackCredits;
        private String operationCode;
        private UUID refundedReservationId;
        private String failureReason;

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException("Scoped usage reservation required");
        }

        @Override
        public Optional<UUID> reserveUsage(
                UUID profileId,
                CreditBucket requestedAllowanceBucket,
                int requestedFallbackCredits,
                String requestedOperationCode
        ) {
            reserveCount++;
            allowanceBucket = requestedAllowanceBucket;
            fallbackCredits = requestedFallbackCredits;
            operationCode = requestedOperationCode;
            return Optional.of(reservationId);
        }

        @Override
        public void refundCredits(UUID reservationId, String reason) {
            refundedReservationId = reservationId;
            failureReason = reason;
        }
    }
}
