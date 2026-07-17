package com.webgen.webgen_backend.account.model;

/**
 * Durable progress stages for the account deletion workflow.
 */
public enum AccountDeletionStage {
    REQUESTED(false, false, false, false),
    STRIPE_CUSTOMER_DELETED(true, false, false, false),
    OBJECT_STORAGE_DELETED(true, true, false, false),
    APPLICATION_DATA_DELETED(true, true, true, false),
    COMPLETED(true, true, true, true);

    private final boolean stripeCleanupComplete;
    private final boolean objectStorageCleanupComplete;
    private final boolean applicationDataCleanupComplete;
    private final boolean accountDeletionComplete;

    AccountDeletionStage(
            boolean stripeCleanupComplete,
            boolean objectStorageCleanupComplete,
            boolean applicationDataCleanupComplete,
            boolean accountDeletionComplete
    ) {
        this.stripeCleanupComplete = stripeCleanupComplete;
        this.objectStorageCleanupComplete = objectStorageCleanupComplete;
        this.applicationDataCleanupComplete = applicationDataCleanupComplete;
        this.accountDeletionComplete = accountDeletionComplete;
    }

    public boolean isStripeCleanupComplete() {
        return stripeCleanupComplete;
    }

    public boolean isObjectStorageCleanupComplete() {
        return objectStorageCleanupComplete;
    }

    public boolean isApplicationDataCleanupComplete() {
        return applicationDataCleanupComplete;
    }

    public boolean isAccountDeletionComplete() {
        return accountDeletionComplete;
    }
}
