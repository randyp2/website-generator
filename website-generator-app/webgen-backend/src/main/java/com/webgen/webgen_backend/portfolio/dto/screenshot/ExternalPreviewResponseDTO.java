package com.webgen.webgen_backend.portfolio.dto.screenshot;

import com.webgen.webgen_backend.portfolio.model.screenshot.SitePreviewStatus;

import java.util.UUID;

/**
 * Reports an external website's pre-publication screenshot state.
 *
 * @param verificationId verified website used as the capture source
 * @param status current asynchronous capture state
 * @param previewUrl completed image URL, or null before capture succeeds
 */
public record ExternalPreviewResponseDTO(
        UUID verificationId,
        SitePreviewStatus status,
        String previewUrl
) {
}
