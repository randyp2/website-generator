package com.webgen.webgen_backend.billing.model;

import java.util.Arrays;

/**
 * Ledger balance namespaces for unrestricted credits and scoped feature allowances.
 */
public enum CreditBucket {
    GENERAL("general"),
    PORTFOLIO_GENERATION("portfolio_generation"),
    PORTFOLIO_REFINEMENT("portfolio_refinement"),
    ASSET_VERIFICATION("asset_verification");

    private final String databaseValue;

    CreditBucket(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    /**
     * Returns the stable value stored in the credit ledger.
     */
    public String databaseValue() {
        return databaseValue;
    }

    /**
     * Resolves a persisted bucket value without depending on enum constant names.
     *
     * @param databaseValue value stored in the database
     * @return matching credit bucket
     * @throws IllegalArgumentException when the value is unsupported
     */
    public static CreditBucket fromDatabaseValue(String databaseValue) {
        return Arrays.stream(values())
                .filter(bucket -> bucket.databaseValue.equals(databaseValue))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported credit bucket: " + databaseValue
                ));
    }
}
