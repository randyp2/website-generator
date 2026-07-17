package com.webgen.webgen_backend.account.integration;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Stripe Java SDK adapter for irreversible customer deletion.
 */
@Component
@RequiredArgsConstructor
public class StripeSdkCustomerDeletionGateway
        implements StripeCustomerDeletionGateway {

    private final StripeClient stripeClient;

    @Override
    public Customer deleteCustomer(String stripeCustomerId) throws StripeException {
        return stripeClient.v1().customers().delete(stripeCustomerId);
    }
}
