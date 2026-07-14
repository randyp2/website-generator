package com.webgen.webgen_backend.portfolio.dto.verification;

import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Client-facing ownership challenge state and installation instructions.
 */
@Data
@Builder
public class SiteOwnershipVerificationDTO {
    private UUID verificationId;
    private String verificationUrl;
    private String canonicalOrigin;
    private SiteVerificationMethod method;
    private SiteVerificationStatus status;
    private String verificationTag;
    private OffsetDateTime challengeExpiresAt;
    private OffsetDateTime verifiedAt;
}
