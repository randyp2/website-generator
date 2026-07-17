package com.webgen.webgen_backend.account.model;

/**
 * Durable progress stages for the account deletion workflow.
 */
public enum AccountDeletionStage {
    REQUESTED(false, false),
    STRIPE_CUSTOMER_DELETED(true, false),
    OBJECT_STORAGE_DELETED(true, true);

    private final boolean stripeCleanupComplete;
    private final boolean objectStorageCleanupComplete;

    AccountDeletionStage(
            boolean stripeCleanupComplete,
            boolean objectStorageCleanupComplete
    ) {
        this.stripeCleanupComplete = stripeCleanupComplete;
        this.objectStorageCleanupComplete = objectStorageCleanupComplete;
    }

    public boolean isStripeCleanupComplete() {
        return stripeCleanupComplete;
    }

    public boolean isObjectStorageCleanupComplete() {
        return objectStorageCleanupComplete;
    }
}
