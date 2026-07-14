package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import org.springframework.stereotype.Component;

/** Maps persisted ownership challenges to their client-facing representation. */
@Component
public class SiteOwnershipVerificationDtoMapper {

    private static final String META_TAG_TEMPLATE =
            "<meta name=\"webgen-site-verification\" content=\"%s\">";

    /** Builds the challenge state and installation tag returned to the client. */
    public SiteOwnershipVerificationDTO toDto(
            SiteOwnershipVerification verification
    ) {
        return SiteOwnershipVerificationDTO.builder()
                .verificationId(verification.getId())
                .verificationUrl(verification.getVerificationUrl())
                .canonicalOrigin(verification.getCanonicalOrigin())
                .method(verification.getMethod())
                .status(verification.getStatus())
                .verificationTag(META_TAG_TEMPLATE.formatted(
                        verification.getChallengeToken()
                ))
                .challengeExpiresAt(verification.getChallengeExpiresAt())
                .verifiedAt(verification.getVerifiedAt())
                .build();
    }
}
