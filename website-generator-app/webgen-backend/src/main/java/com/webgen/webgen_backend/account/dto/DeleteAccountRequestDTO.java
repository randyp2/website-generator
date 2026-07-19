package com.webgen.webgen_backend.account.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Explicit destructive-action confirmation supplied by the account owner.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeleteAccountRequestDTO {

    private String confirmation;
}
