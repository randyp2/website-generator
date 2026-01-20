package com.webgen.webgen_backend.controller;

import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.clarifier.ClarifierResponseDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.planner.PlannerResponseDTO;
import com.webgen.webgen_backend.portfolio_service.builder.BuilderService;
import com.webgen.webgen_backend.portfolio_service.clarifier.ClarifierService;
import com.webgen.webgen_backend.portfolio_service.planner.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio/refine")
@RequiredArgsConstructor
public class PortfolioRefineController {

    private final ClarifierService clarifierService;
    private final PlannerService plannerService;
    private final BuilderService builderService;

    @PostMapping("/clarify")
    public ResponseEntity<ClarifierResponseDTO> clarify(
            @RequestBody ClarifierRequestDTO req
    ) {
        ClarifierResponseDTO response = clarifierService.clarify(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/plan")
    public ResponseEntity<PlannerResponseDTO> plan(
            @RequestBody PlannerRequestDTO req
    ) {
        PlannerResponseDTO response = plannerService.plan(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/build")
    public ResponseEntity<BuilderResponseDTO> build(
            @RequestBody BuilderRequestDTO req
    ) {
        BuilderResponseDTO response = builderService.build(req);
        return ResponseEntity.ok(response);
    }
}
