package com.webgen.webgen_backend.portfolio.dto.screenshot;

import java.util.UUID;

/**
 * Reports the active generated version's screenshot state.
 *
 * @param versionId active generated version being represented
 * @param status current asynchronous capture state
 * @param previewUrl completed image URL, or null while capture is pending
 */
public record GeneratedPreviewResponseDTO(
        UUID versionId,
        Status status,
        String previewUrl
) {
    public enum Status {
        QUEUED,
        PENDING,
        READY
    }
}
