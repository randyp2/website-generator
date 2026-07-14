package com.webgen.webgen_backend.portfolio.service.verification;

import com.webgen.webgen_backend.portfolio.dto.verification.SiteOwnershipVerificationDTO;
import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import org.springframework.stereotype.Component;

/** Maps persisted ownership challenges to their client-facing representation. */
@Component
public class SiteOwnershipVerificationDtoMapper {

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
                .verificationTag(SiteVerificationProtocol.buildMetaTag(
                        verification.getChallengeToken()
                ))
                .challengeExpiresAt(verification.getChallengeExpiresAt())
                .verifiedAt(verification.getVerifiedAt())
                .build();
    }
}
