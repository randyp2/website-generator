package com.webgen.webgen_backend.controller.portfolio;

import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.*;
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

        PortfolioDetailDTO portfolioDetailDTO = portfolioCrudService.getPortfolio(userId, id);
        return ResponseEntity.ok(portfolioDetailDTO);
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

    @PostMapping("/{id}/uploads")
    public ResponseEntity<UploadPortfolioResponseDTO> saveUploads(
            @PathVariable UUID id,
            @RequestBody UploadPortfolioRequestDTO request) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        UploadPortfolioResponseDTO uploadPortfolioResponseDTO = portfolioCrudService.saveUploads(userId, id, request);
        return ResponseEntity.ok(uploadPortfolioResponseDTO);
    }

    @PatchMapping("/{id}/resume")
    public ResponseEntity<ResumeDTO> updateResume(
            @PathVariable UUID id,
            @RequestBody UpdateResumeRequestDTO request
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        ResumeDTO resumeDTO = portfolioCrudService.updateResume(userId, id, request);

        return ResponseEntity.ok(resumeDTO);
    }
}

