package com.webgen.webgen_backend.portfolio.billing;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;

/** Credit and scoped allowance policies for AI-backed portfolio operations. */
public final class PortfolioCreditCostPolicy {

    private PortfolioCreditCostPolicy() {
    }

    public static final int STYLE_CHAT_REQUIRED_CREDITS = 1;
    public static final int REFINE_CLARIFY_REQUIRED_CREDITS = 1;
    public static final int REFINE_PLAN_REQUIRED_CREDITS = 2;
    public static final int REFINE_BUILD_REQUIRED_CREDITS = 6;
    public static final int GENERATE_PORTFOLIO_REQUIRED_CREDITS = 10;

    public static final CreditUsagePolicy STYLE_CHAT_USAGE = new CreditUsagePolicy(
            CreditBucket.PORTFOLIO_REFINEMENT,
            STYLE_CHAT_REQUIRED_CREDITS,
            "style_chat"
    );
    public static final CreditUsagePolicy REFINE_CLARIFY_USAGE = new CreditUsagePolicy(
            CreditBucket.PORTFOLIO_REFINEMENT,
            REFINE_CLARIFY_REQUIRED_CREDITS,
            "refine_clarify"
    );
    public static final CreditUsagePolicy REFINE_PLAN_USAGE = new CreditUsagePolicy(
            CreditBucket.PORTFOLIO_REFINEMENT,
            REFINE_PLAN_REQUIRED_CREDITS,
            "refine_plan"
    );
    public static final CreditUsagePolicy REFINE_BUILD_USAGE = new CreditUsagePolicy(
            CreditBucket.PORTFOLIO_REFINEMENT,
            REFINE_BUILD_REQUIRED_CREDITS,
            "refine_build"
    );
    public static final CreditUsagePolicy GENERATE_PORTFOLIO_USAGE = new CreditUsagePolicy(
            CreditBucket.PORTFOLIO_GENERATION,
            GENERATE_PORTFOLIO_REQUIRED_CREDITS,
            "portfolio_generation"
    );
}
