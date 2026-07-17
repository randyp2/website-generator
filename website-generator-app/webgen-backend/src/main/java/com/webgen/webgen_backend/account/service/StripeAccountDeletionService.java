package com.webgen.webgen_backend.account.service;

/**
 * Removes a user's Stripe customer and cancels subscriptions owned by that customer.
 */
public interface StripeAccountDeletionService {

    /**
     * Deletes the Stripe customer when one exists. Repeated calls are safe.
     *
     * @param stripeCustomerId Stripe customer identifier, or {@code null} when none was created
     */
    void deleteCustomer(String stripeCustomerId);
}
