package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionRequestDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;

import java.util.UUID;

public interface BillingCheckoutService {

    /**
     * Creates a Stripe Checkout session for the authenticated user and selected pricing key.
     * The resulting session URL is used by the frontend to redirect users into hosted checkout.
     *
     * @param profileId authenticated profile id from JWT principal
     * @param request selected billing purchase option
     * @return created checkout session payload
     */
    CreateCheckoutSessionResponseDTO createCheckoutSession(
            UUID profileId,
            CreateCheckoutSessionRequestDTO request
    );
}
