package com.webgen.webgen_backend.portfolio.controller;

import com.webgen.webgen_backend.portfolio.dto.verification.CreateSiteOwnershipVerificationRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipVerificationCheckService;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipVerificationService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Authenticated API for external website ownership challenges.
 */
@RestController
@RequestMapping("/api/v1/portfolio/site-verifications")
@RequiredArgsConstructor
public class SiteOwnershipVerificationController {

    private static final String CHALLENGE_RATE_LIMIT_POLICY =
            "site-verification-challenge";
    private static final String CHECK_RATE_LIMIT_POLICY =
            "site-verification-check";

    private final SiteOwnershipVerificationService service;
    private final SiteOwnershipVerificationCheckService checkService;
    private final RateLimiterService rateLimiterService;

    /**
     * Creates or returns the active ownership challenge for an external URL.
     */
    @PostMapping
    public ResponseEntity<SiteOwnershipVerificationDTO> createChallenge(
            @RequestBody CreateSiteOwnershipVerificationRequestDTO request
    ) {
        UUID userId = authenticatedUserId();
        rateLimiterService.check(CHALLENGE_RATE_LIMIT_POLICY, userId.toString());
        return ResponseEntity.ok(service.createChallenge(userId, request));
    }

    /** Checks the deployed page for the active ownership challenge. */
    @PostMapping("/{verificationId}/verify")
    public ResponseEntity<SiteOwnershipVerificationDTO> verifyChallenge(
            @PathVariable UUID verificationId
    ) {
        UUID userId = authenticatedUserId();
        rateLimiterService.check(CHECK_RATE_LIMIT_POLICY, userId.toString());
        return ResponseEntity.ok(checkService.verify(userId, verificationId));
    }

    private UUID authenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal()
        );
    }
}
