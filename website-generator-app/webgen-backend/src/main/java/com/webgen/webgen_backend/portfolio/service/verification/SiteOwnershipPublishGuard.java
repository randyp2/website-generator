package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.CanonicalSiteUrl;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/** Authorizes an external publication using a verified ownership challenge. */
@Service
@RequiredArgsConstructor
@Slf4j
public class SiteOwnershipPublishGuard {

    private final SiteOwnershipVerificationRepository repository;
    private final SiteVerificationUrlCanonicalizer urlCanonicalizer;

    /**
     * Requires a user-owned, completed challenge bound to the exact published URL.
     *
     * @return verified ownership data safe to persist on the portfolio
     */
    public VerifiedSiteOwnership requireVerified(
            UUID userId,
            UUID verificationId,
            String externalUrl
    ) {
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }
        if (verificationId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Website ownership verification is required"
            );
        }

        SiteOwnershipVerification verification = repository
                .findByIdAndUserId(verificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Website ownership verification was not found"
                ));
        if (verification.getStatus() != SiteVerificationStatus.VERIFIED
                || verification.getVerifiedAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Website ownership verification is incomplete"
            );
        }

        CanonicalSiteUrl publishedUrl = canonicalize(externalUrl);
        if (!verification.getVerificationUrl().equals(
                publishedUrl.verificationUrl()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Website verification does not match the external URL"
            );
        }

        log.info(
                "site.verification.publish outcome=authorized verificationId={} userId={} url={}",
                verificationId,
                userId,
                publishedUrl.verificationUrl()
        );
        return new VerifiedSiteOwnership(
                verification.getId(),
                verification.getPreviewStatus() == SitePreviewStatus.READY
                        ? verification.getPreviewUrl()
                        : null
        );
    }

    private CanonicalSiteUrl canonicalize(String externalUrl) {
        try {
            return urlCanonicalizer.canonicalize(externalUrl);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );
        }
    }
}
