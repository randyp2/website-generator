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
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping("/clarify")
    public ResponseEntity<ClarifierResponseDTO> clarify(
            @RequestBody ClarifierRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());

        ClarifierResponseDTO response = clarifierService.clarify(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/plan")
    public ResponseEntity<PlannerResponseDTO> plan(
            @RequestBody PlannerRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());

        PlannerResponseDTO response = plannerService.plan(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<BuilderResponseDTO> build(
            @RequestBody BuilderRequestDTO req
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.verifyOwnership(userId, req.getPortfolioId());

        BuilderResponseDTO response = builderService.build(req, userId);
        return ResponseEntity.ok(response);
    }
}
