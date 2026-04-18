package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.common.ResumeDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.*;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;
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

    @GetMapping("/{id}/resume")
    public ResponseEntity<ResumeDTO> getResume(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        ResumeDTO resumeDTO = portfolioCrudService.getResume(userId, id);
        return ResponseEntity.ok(resumeDTO);
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

    @GetMapping("/{id}/load")
    public ResponseEntity<PortfolioLoadResponseDTO> loadPortfolio(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        PortfolioLoadResponseDTO response = portfolioCrudService.loadPortfolio(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<VersionListResponseDTO> listVersions(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        VersionListResponseDTO response = portfolioCrudService.listVersions(userId, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/versions/{versionId}/activate")
    public ResponseEntity<ActivateVersionResponseDTO> activateVersion(
            @PathVariable UUID id,
            @PathVariable UUID versionId) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        ActivateVersionResponseDTO response = portfolioCrudService.activateVersion(userId, id, versionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/publish")
    public ResponseEntity<PublishResponseDTO> publishPortfolio(
            @RequestBody @Valid PublishRequestDTO request) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        PublishResponseDTO response = portfolioCrudService.publishPortfolio(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<Void> unpublishPortfolio(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        portfolioCrudService.unpublishPortfolio(userId, id);
        return ResponseEntity.noContent().build();
    }
}
