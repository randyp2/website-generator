package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Verifies pending external website ownership challenges against deployed HTML.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SiteOwnershipVerificationCheckService {

    private final SiteOwnershipVerificationRepository repository;
    private final SiteVerificationPageClient pageClient;
    private final SiteVerificationMetaTagMatcher metaTagMatcher;
    private final SiteOwnershipVerificationDtoMapper dtoMapper;

    /**
     * Fetches the bound page and marks the challenge verified on an exact match.
     */
    public SiteOwnershipVerificationDTO verify(UUID userId, UUID verificationId) {
        if (userId == null)
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required");

        if (verificationId == null)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "verificationId is required");

        SiteOwnershipVerification verification = repository
                .findByIdAndUserId(verificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Website verification was not found"));
        if (verification.getStatus() == SiteVerificationStatus.VERIFIED) {
            logOutcome("already_verified", verification);
            return dtoMapper.toDto(verification);
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (verification.getStatus() == SiteVerificationStatus.EXPIRED
                || !verification.getChallengeExpiresAt().isAfter(now)) {
            expire(verification);
            logOutcome("expired", verification);
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Website verification challenge has expired");
        }

        String html = fetchHtml(verification);
        if (!metaTagMatcher.containsToken(
                html,
                verification.getChallengeToken())) {
            logOutcome("tag_missing", verification);
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Verification tag was not found in the deployed page source");
        }

        verification.setStatus(SiteVerificationStatus.VERIFIED);
        verification.setVerifiedAt(now);
        SiteOwnershipVerification saved = repository.save(verification);
        logOutcome("verified", saved);
        return dtoMapper.toDto(saved);
    }

    private String fetchHtml(SiteOwnershipVerification verification) {
        try {
            return pageClient.fetchHtml(verification.getVerificationUrl());
        } catch (SiteVerificationPageFetchException exception) {
            logOutcome("fetch_failed", verification);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    exception.getMessage(),
                    exception);
        }
    }

    private void expire(SiteOwnershipVerification verification) {
        if (verification.getStatus() == SiteVerificationStatus.EXPIRED) {
            return;
        }
        verification.setStatus(SiteVerificationStatus.EXPIRED);
        verification.setVerifiedAt(null);
        repository.save(verification);
    }

    private void logOutcome(
            String outcome,
            SiteOwnershipVerification verification) {
        log.info(
                "site.verification.check outcome={} verificationId={} userId={} origin={} status={}",
                outcome,
                verification.getId(),
                verification.getUserId(),
                verification.getCanonicalOrigin(),
                verification.getStatus());
    }
}
