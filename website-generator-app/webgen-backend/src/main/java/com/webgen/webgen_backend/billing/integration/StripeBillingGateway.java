package com.webgen.webgen_backend.billing.integration;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Narrow Stripe SDK boundary used by interactive billing flows.
 */
@Component
@RequiredArgsConstructor
public class StripeBillingGateway {

    private final StripeClient stripeClient;

    /** Creates a Stripe customer. */
    public Customer createCustomer(CustomerCreateParams params) throws StripeException {
        return stripeClient.v1().customers().create(params);
    }

    /** Creates a Stripe Checkout session. */
    public Session createCheckoutSession(SessionCreateParams params) throws StripeException {
        return stripeClient.v1().checkout().sessions().create(params);
    }

    /** Creates a Stripe Billing Portal session. */
    public com.stripe.model.billingportal.Session createPortalSession(
            com.stripe.param.billingportal.SessionCreateParams params
    ) throws StripeException {
        return stripeClient.v1().billingPortal().sessions().create(params);
    }
}
