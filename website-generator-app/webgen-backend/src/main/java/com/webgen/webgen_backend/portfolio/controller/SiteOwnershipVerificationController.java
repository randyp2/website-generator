package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.verification.CreateSiteOwnershipVerificationRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipVerificationService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Authenticated API for creating external website ownership challenges.
 */
@RestController
@RequestMapping("/api/v1/portfolio/site-verifications")
@RequiredArgsConstructor
public class SiteOwnershipVerificationController {

    private static final String RATE_LIMIT_POLICY = "site-verification-challenge";

    private final SiteOwnershipVerificationService service;
    private final RateLimiterService rateLimiterService;

    /**
     * Creates or returns the active ownership challenge for an external URL.
     */
    @PostMapping
    public ResponseEntity<SiteOwnershipVerificationDTO> createChallenge(
            @RequestBody CreateSiteOwnershipVerificationRequestDTO request
    ) {
        UUID userId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        rateLimiterService.check(RATE_LIMIT_POLICY, userId.toString());
        return ResponseEntity.ok(service.createChallenge(userId, request));
    }
}
