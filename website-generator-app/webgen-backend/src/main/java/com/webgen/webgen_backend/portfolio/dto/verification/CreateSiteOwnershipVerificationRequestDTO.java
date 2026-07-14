package com.webgen.webgen_backend.portfolio.dto.verification;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Requests an ownership challenge for an externally hosted portfolio URL.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateSiteOwnershipVerificationRequestDTO {
    private String externalUrl;
}
