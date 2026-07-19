package com.webgen.webgen_backend.account.integration;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Narrow Stripe SDK boundary used by account deletion.
 */
@Component
@RequiredArgsConstructor
public class StripeCustomerDeletionGateway {

    private final StripeClient stripeClient;

    /**
     * Permanently deletes the requested Stripe customer.
     */
    public Customer deleteCustomer(String stripeCustomerId) throws StripeException {
        return stripeClient.v1().customers().delete(stripeCustomerId);
    }
}
