package com.webgen.webgen_backend.account.integration;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;

/**
 * Narrow Stripe SDK boundary used by account deletion.
 */
public interface StripeCustomerDeletionGateway {

    Customer deleteCustomer(String stripeCustomerId) throws StripeException;
}
