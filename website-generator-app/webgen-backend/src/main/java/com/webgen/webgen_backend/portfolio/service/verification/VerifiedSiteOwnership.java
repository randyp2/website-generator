package com.webgen.webgen_backend.portfolio.service.verification;

import java.util.UUID;

/**
 * Website ownership data authorized for external publication.
 *
 * @param verificationId verification persisted on the published portfolio
 * @param previewUrl completed pre-publication screenshot, when available
 */
public record VerifiedSiteOwnership(UUID verificationId, String previewUrl) {
}
