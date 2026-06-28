package com.webgen.webgen_backend.verification.service.scoring;

/**
 * Deterministic reason code plus user-facing text explaining a claim's score.
 */
record ClaimReasonComputation(
        String code,
        String text
) {
}
