package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio.service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio.service.planner.PlannerService;
import com.webgen.webgen_backend.portfolio.service.refine.RefineChatTurnHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/refine")
@RequiredArgsConstructor
@Slf4j
public class PortfolioRefineController {

    private final ClarifierService clarifierService;
    private final PlannerService plannerService;
    private final BuilderService builderService;
    private final PortfolioCrudService portfolioCrudService;
    private final CreditGuardService creditGuardService;
    private final RateLimiterService rateLimiterService;
    private final RefineChatTurnHistoryService refineChatTurnHistoryService;

    @PostMapping("/clarify")
    public ResponseEntity<ClarifierResponseDTO> clarify(
            @RequestBody ClarifierRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("refine-turn", userId.toString());
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());
        UUID creditReservationId = creditGuardService.reserveCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_CLARIFY_REQUIRED_CREDITS,
                "refine_clarify"
        ).orElse(null);

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
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            refundReservation(creditReservationId, failure);
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
        UUID creditReservationId = creditGuardService.reserveCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_PLAN_REQUIRED_CREDITS,
                "refine_plan"
        ).orElse(null);

        try {
            long startedAtMillis = System.currentTimeMillis();
            PlannerResponseDTO response = plannerService.plan(req);
            refineChatTurnHistoryService.recordPlannerTurn(
                    userId,
                    req.getPortfolioId(),
                    response,
                    elapsedSeconds(startedAtMillis)
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            refundReservation(creditReservationId, failure);
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
        UUID creditReservationId = creditGuardService.reserveCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_BUILD_REQUIRED_CREDITS,
                "refine_build"
        ).orElse(null);

        try {
            BuilderResponseDTO response = builderService.build(req, userId, creditReservationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException failure) {
            refundReservation(creditReservationId, failure);
            throw failure;
        }
    }

    private int elapsedSeconds(long startedAtMillis) {
        return Math.max(0, (int) ((System.currentTimeMillis() - startedAtMillis) / 1000));
    }

    private void refundReservation(UUID reservationId, RuntimeException failure) {
        if (reservationId == null) {
            return;
        }
        try {
            creditGuardService.refundCredits(reservationId, failureCode(failure));
        } catch (RuntimeException refundFailure) {
            failure.addSuppressed(refundFailure);
            log.error("Failed to refund credit reservation {}", reservationId, refundFailure);
        }
    }

    private String failureCode(Exception failure) {
        return failure.getClass().getSimpleName();
    }
}
