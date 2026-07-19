package com.webgen.webgen_backend.verification.billing;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;

/** Credit costs for AI-backed verification operations. */
public final class VerificationCreditCostPolicy {

    public static final int ASSET_VERIFICATION_REQUIRED_CREDITS = 1;
    public static final CreditUsagePolicy ASSET_VERIFICATION_USAGE = new CreditUsagePolicy(
            CreditBucket.ASSET_VERIFICATION,
            ASSET_VERIFICATION_REQUIRED_CREDITS,
            "asset_verification"
    );

    private VerificationCreditCostPolicy() {
    }
}
