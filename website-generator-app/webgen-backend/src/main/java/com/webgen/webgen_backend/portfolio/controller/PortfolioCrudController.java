package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.portfolio.billing.PortfolioCreditCostPolicy;
import com.webgen.webgen_backend.portfolio.dto.common.ResumeDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.*;
import com.webgen.webgen_backend.portfolio.dto.upload.CreatePortfolioUploadPresignRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.CreatePortfolioUploadPresignResponseDTO;
import com.webgen.webgen_backend.portfolio.service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio.service.upload.PortfolioUploadService;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.springframework.web.bind.annotation.*;


import javax.validation.Valid;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioCrudController {

    private final PortfolioCrudService portfolioCrudService;
    private final PortfolioUploadService portfolioUploadService;
    private final RateLimiterService rateLimiterService;
    private final CreditGuardService creditGuardService;

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
        rateLimiterService.check("portfolio-draft", userId.toString());
        creditGuardService.assertUsageAvailable(
                userId,
                PortfolioCreditCostPolicy.GENERATE_PORTFOLIO_USAGE
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

        rateLimiterService.check("portfolio-upload-finalize", userId.toString());
        UploadPortfolioResponseDTO uploadPortfolioResponseDTO = portfolioUploadService.finalizeUploads(
                userId,
                id,
                request
        );
        return ResponseEntity.ok(uploadPortfolioResponseDTO);
    }

    /** Issues scoped Supabase tokens after authenticating portfolio ownership. */
    @PostMapping("/{id}/uploads/presign")
    public ResponseEntity<CreatePortfolioUploadPresignResponseDTO> presignUploads(
            @PathVariable UUID id,
            @RequestBody CreatePortfolioUploadPresignRequestDTO request
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("portfolio-upload-presign", userId.toString());
        return ResponseEntity.ok(
                portfolioUploadService.createUploadInstructions(userId, id, request)
        );
    }

    /** Parses the finalized private resume by storage reference. */
    @PostMapping("/{id}/resume/parse-uploaded")
    public ResponseEntity<ParsedResumeDTO> parseUploadedResume(
            @PathVariable UUID id,
            @RequestParam(value = "llmFallback", required = false) Boolean llmFallback
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check("resume-parse", userId.toString());
        return ResponseEntity.ok(
                portfolioUploadService.parseStoredResume(userId, id, llmFallback)
        );
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

    @PostMapping("/{id}/versions/publish-current")
    public ResponseEntity<ActivateVersionResponseDTO> publishCurrentVersion(@PathVariable UUID id) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        ActivateVersionResponseDTO response = portfolioCrudService.publishActiveVersion(userId, id);
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
