package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.screenshot.ExternalPreviewResponseDTO;
import com.webgen.webgen_backend.portfolio.service.screenshot.ExternalPortfolioPreviewService;
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
@RequestMapping("/api/v1/portfolio/site-verifications/{verificationId}/preview-screenshot")
@RequiredArgsConstructor
public class ExternalPortfolioPreviewController {

    private static final String RATE_LIMIT_POLICY = "portfolio-preview-screenshot";

    private final ExternalPortfolioPreviewService previewService;
    private final RateLimiterService rateLimiterService;

    /** Requests or retries the verified website's preview capture. */
    @PostMapping
    public ResponseEntity<ExternalPreviewResponseDTO> requestPreview(@PathVariable UUID verificationId) {
        UUID userId = currentUserId();
        rateLimiterService.check(RATE_LIMIT_POLICY, userId.toString());
        return ResponseEntity.accepted().body(previewService.requestPreview(userId, verificationId));
    }

    /** Returns the verified website's current preview capture state. */
    @GetMapping
    public ResponseEntity<ExternalPreviewResponseDTO> getPreview(@PathVariable UUID verificationId) {
        return ResponseEntity.ok(previewService.getPreview(currentUserId(), verificationId));
    }

    private UUID currentUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
