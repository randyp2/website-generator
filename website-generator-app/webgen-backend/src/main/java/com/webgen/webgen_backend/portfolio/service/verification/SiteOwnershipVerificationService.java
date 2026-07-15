package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.dto.verification.CreateSiteOwnershipVerificationRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.CanonicalSiteUrl;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Issues idempotent one-time challenges for external website ownership.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SiteOwnershipVerificationService {

    private static final Duration CHALLENGE_TTL = Duration.ofHours(24);
    private final SiteOwnershipVerificationRepository repository;
    private final SiteVerificationUrlCanonicalizer urlCanonicalizer;
    private final SiteVerificationTokenGenerator tokenGenerator;
    private final SiteOwnershipVerificationDtoMapper dtoMapper;

    /**
     * Creates, reuses, or refreshes a challenge for the authenticated user and URL.
     */
    @Transactional
    public SiteOwnershipVerificationDTO createChallenge(
            UUID userId,
            CreateSiteOwnershipVerificationRequestDTO request) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        CanonicalSiteUrl siteUrl = canonicalize(request.getExternalUrl());
        OffsetDateTime now = OffsetDateTime.now();
        SiteVerificationMethod method = SiteVerificationMethod.HTML_META;
        SiteOwnershipVerification verification = repository
                .findByUserIdAndVerificationUrlAndMethod(
                        userId,
                        siteUrl.verificationUrl(),
                        method)
                .orElse(null);

        if (isReusable(verification, now)) {
            logChallenge("reused", verification);
            return dtoMapper.toDto(verification);
        }

        SiteOwnershipVerification pending = preparePending(
                verification,
                userId,
                siteUrl,
                method,
                now);
        SiteOwnershipVerification saved = repository.save(pending);
        logChallenge("issued", saved);
        return dtoMapper.toDto(saved);
    }

    private CanonicalSiteUrl canonicalize(String externalUrl) {
        try {
            return urlCanonicalizer.canonicalize(externalUrl);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception);
        }
    }

    private boolean isReusable(SiteOwnershipVerification verification, OffsetDateTime now) {
        if (verification == null)
            return false;

        if (verification.getStatus() == SiteVerificationStatus.VERIFIED)
            return true;

        return verification.getStatus() == SiteVerificationStatus.PENDING
                && verification.getChallengeExpiresAt().isAfter(now);
    }

    private SiteOwnershipVerification preparePending(
            SiteOwnershipVerification existing,
            UUID userId,
            CanonicalSiteUrl siteUrl,
            SiteVerificationMethod method,
            OffsetDateTime now) {
        SiteOwnershipVerification verification = existing == null
                ? new SiteOwnershipVerification()
                : existing;
        verification.setUserId(userId);
        verification.setVerificationUrl(siteUrl.verificationUrl());
        verification.setCanonicalOrigin(siteUrl.origin());
        verification.setMethod(method);
        verification.setChallengeToken(tokenGenerator.generate());
        verification.setStatus(SiteVerificationStatus.PENDING);
        verification.setChallengeExpiresAt(now.plus(CHALLENGE_TTL));
        verification.setVerifiedAt(null);
        verification.setPreviewUrl(null);
        verification.setPreviewStatus(SitePreviewStatus.NOT_REQUESTED);
        verification.setPreviewCapturedAt(null);
        return verification;
    }

    private void logChallenge(String action, SiteOwnershipVerification verification) {
        log.info(
                "site.verification.challenge action={} verificationId={} userId={} origin={} status={}",
                action,
                verification.getId(),
                verification.getUserId(),
                verification.getCanonicalOrigin(),
                verification.getStatus());
    }
}
