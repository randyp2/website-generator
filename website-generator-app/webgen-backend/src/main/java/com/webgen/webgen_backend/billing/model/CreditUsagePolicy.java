package com.webgen.webgen_backend.billing.model;

import java.util.Objects;

/**
 * Maps one billable feature to its scoped allowance and general-credit fallback.
 *
 * @param allowanceBucket scoped allowance consumed before general credits
 * @param fallbackCredits general credits charged when no allowance remains
 * @param operationCode stable operation identifier stored in ledger metadata
 */
public record CreditUsagePolicy(
        CreditBucket allowanceBucket,
        int fallbackCredits,
        String operationCode
) {

    public CreditUsagePolicy {
        Objects.requireNonNull(allowanceBucket, "Allowance bucket is required");
        if (allowanceBucket == CreditBucket.GENERAL) {
            throw new IllegalArgumentException("Usage policy requires a scoped allowance bucket");
        }
        if (fallbackCredits <= 0) {
            throw new IllegalArgumentException("Fallback credits must be positive");
        }
        if (operationCode == null || operationCode.isBlank()) {
            throw new IllegalArgumentException("Operation code is required");
        }
        operationCode = operationCode.trim();
    }
}
