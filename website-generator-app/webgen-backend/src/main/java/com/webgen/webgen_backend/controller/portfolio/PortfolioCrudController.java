package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.crud.CreatePortfolioRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioDetailDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.PortfolioListDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.UpdatePortfolioRequestDTO;
import com.webgen.webgen_backend.portfolio_service.crud.PortfolioCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.UUID;
@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioCrudController {

    private final PortfolioCrudService portfolioCrudService;

    @GetMapping("/list")
    public ResponseEntity<PortfolioListDTO> listPortfolios() {

        // Extract userId from JWT payload
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        PortfolioListDTO response = portfolioCrudService.listPortfolios(userId);
        return ResponseEntity.ok(response);

    }

    @PostMapping("/draft")
    public ResponseEntity<PortfolioDTO> createDraft(@RequestBody CreatePortfolioRequestDTO request) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        PortfolioDTO response = portfolioCrudService.createDraft(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioDetailDTO> getPortfolio(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        return ResponseEntity.ok(portfolioCrudService.getPortfolio(userId, id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PortfolioDTO> updatePortfolio(
            @PathVariable UUID id,
            @RequestBody UpdatePortfolioRequestDTO request) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        PortfolioDTO response = portfolioCrudService.updatePortfolio(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.deletePortfolio(userId, id);
        return ResponseEntity.noContent().build();
    }
}

