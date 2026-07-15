package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.screenshot.GeneratedPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.service.screenshot.GeneratedPortfolioPreviewService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio/{portfolioId}/preview-screenshot")
@RequiredArgsConstructor
public class GeneratedPortfolioPreviewController {

    private final GeneratedPortfolioPreviewService previewService;
    private final RateLimiterService rateLimiterService;

    @PostMapping
    public ResponseEntity<GeneratedPreviewResponseDTO> requestPreview(@PathVariable UUID portfolioId) {
        UUID userId = currentUserId();
        rateLimiterService.check("portfolio-preview-screenshot", userId.toString());
        return ResponseEntity.accepted().body(previewService.requestPreview(userId, portfolioId));
    }

    @GetMapping
    public ResponseEntity<GeneratedPreviewResponseDTO> getPreview(@PathVariable UUID portfolioId) {
        return ResponseEntity.ok().body(previewService.getPreview(currentUserId(), portfolioId));
    }

    private UUID currentUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
