package com.webgen.webgen_backend.account.model;

/**
 * Durable progress stages for the account deletion workflow.
 */
public enum AccountDeletionStage {
    REQUESTED(false),
    STRIPE_CUSTOMER_DELETED(true);

    private final boolean stripeCleanupComplete;

    AccountDeletionStage(boolean stripeCleanupComplete) {
        this.stripeCleanupComplete = stripeCleanupComplete;
    }

    public boolean isStripeCleanupComplete() {
        return stripeCleanupComplete;
    }
}
