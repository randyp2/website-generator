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
        creditGuardService.consumeCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_CLARIFY_REQUIRED_CREDITS,
                "refine_clarify"
        );

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
        creditGuardService.consumeCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_PLAN_REQUIRED_CREDITS,
                "refine_plan"
        );

        long startedAtMillis = System.currentTimeMillis();
        PlannerResponseDTO response = plannerService.plan(req);
        refineChatTurnHistoryService.recordPlannerTurn(
                userId,
                req.getPortfolioId(),
                response,
                elapsedSeconds(startedAtMillis)
        );
        return ResponseEntity.ok(response);
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
        creditGuardService.consumeCredits(
                userId,
                PortfolioCreditCostPolicy.REFINE_BUILD_REQUIRED_CREDITS,
                "refine_build"
        );

        BuilderResponseDTO response = builderService.build(req, userId);
        return ResponseEntity.ok(response);
    }

    private int elapsedSeconds(long startedAtMillis) {
        return Math.max(0, (int) ((System.currentTimeMillis() - startedAtMillis) / 1000));
    }
}
