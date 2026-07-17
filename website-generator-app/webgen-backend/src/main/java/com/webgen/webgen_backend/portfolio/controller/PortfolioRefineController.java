package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.portfolio.service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio.service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio.service.planner.PlannerService;
import com.webgen.webgen_backend.portfolio.service.refine.RefineChatTurnHistoryService;
import com.webgen.webgen_backend.portfolio.service.refine.RefinementSessionService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/refine")
@RequiredArgsConstructor
@Slf4j
public class PortfolioRefineController {

    private static final int MAX_CLARIFIER_PROMPT_LENGTH = 4_000;

    private final ClarifierService clarifierService;
    private final PlannerService plannerService;
    private final BuilderService builderService;
    private final PortfolioCrudService portfolioCrudService;
    private final RateLimiterService rateLimiterService;
    private final RefineChatTurnHistoryService refineChatTurnHistoryService;
    private final RefinementSessionService refinementSessionService;

    @PostMapping("/clarify")
    public ResponseEntity<ClarifierResponseDTO> clarify(
            @RequestBody ClarifierRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("refine-turn", userId.toString());
        validateClarifierRequest(req);
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        UUID sessionId = refinementSessionService.beginClarifierTurn(
                userId,
                req.getPortfolioId(),
                req.getSessionId()
        );
        req.setSessionId(sessionId.toString());

        try {
            long startedAtMillis = System.currentTimeMillis();
            ClarifierResponseDTO response = clarifierService.clarify(req);
            refineChatTurnHistoryService.recordClarifierTurn(
                    userId,
                    req.getPortfolioId(),
                    req.getUserPrompt(),
                    response,
                    elapsedSeconds(startedAtMillis)
            );
            refinementSessionService.completeClarifierTurn(
                    userId,
                    req.getPortfolioId(),
                    sessionId.toString()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            failAiTurn(userId, req.getPortfolioId(), sessionId.toString(), failure);
            throw failure;
        }
    }

    @PostMapping("/plan")
    public ResponseEntity<PlannerResponseDTO> plan(
            @RequestBody PlannerRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("refine-turn", userId.toString());
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        refinementSessionService.beginPlannerTurn(
                userId,
                req.getPortfolioId(),
                req.getSessionId()
        );

        try {
            long startedAtMillis = System.currentTimeMillis();
            PlannerResponseDTO response = plannerService.plan(req);
            refineChatTurnHistoryService.recordPlannerTurn(
                    userId,
                    req.getPortfolioId(),
                    response,
                    elapsedSeconds(startedAtMillis)
            );
            refinementSessionService.completePlannerTurn(
                    userId,
                    req.getPortfolioId(),
                    req.getSessionId()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            failAiTurn(userId, req.getPortfolioId(), req.getSessionId(), failure);
            throw failure;
        }
    }

    @PostMapping("/build")
    public ResponseEntity<BuilderResponseDTO> build(
            @RequestBody BuilderRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("refine-build", userId.toString());
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        refinementSessionService.beginBuild(
                userId,
                req.getPortfolioId(),
                req.getSessionId()
        );

        try {
            BuilderResponseDTO response = builderService.build(req, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            failBuild(userId, req.getPortfolioId(), req.getSessionId(), failure);
            throw failure;
        }
    }

    private int elapsedSeconds(long startedAtMillis) {
        return Math.max(0, (int) ((System.currentTimeMillis() - startedAtMillis) / 1000));
    }

    private void validateClarifierRequest(ClarifierRequestDTO request) {
        if (request == null
                || request.getPortfolioId() == null
                || request.getUserPrompt() == null
                || request.getUserPrompt().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "portfolioId and userPrompt are required"
            );
        }
        if (request.getUserPrompt().length() > MAX_CLARIFIER_PROMPT_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Refinement messages cannot exceed 4000 characters"
            );
        }
    }

    private void failAiTurn(
            UUID userId,
            UUID portfolioId,
            String sessionId,
            RuntimeException failure
    ) {
        try {
            refinementSessionService.failAiTurn(
                    userId,
                    portfolioId,
                    sessionId,
                    failureCode(failure)
            );
        } catch (RuntimeException sessionFailure) {
            failure.addSuppressed(sessionFailure);
            log.error("Failed to release refinement session {}", sessionId, sessionFailure);
        }
    }

    private void failBuild(
            UUID userId,
            UUID portfolioId,
            String sessionId,
            RuntimeException failure
    ) {
        try {
            refinementSessionService.failBuild(userId, portfolioId, sessionId);
        } catch (RuntimeException sessionFailure) {
            failure.addSuppressed(sessionFailure);
            log.error("Failed to reopen refinement build {}", sessionId, sessionFailure);
        }
    }

    private String failureCode(Exception failure) {
        return failure.getClass().getSimpleName();
    }
}
