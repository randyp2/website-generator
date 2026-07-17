package com.webgen.webgen_backend.account.service.impl;

import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.webgen.webgen_backend.account.integration.StripeCustomerDeletionGateway;
import com.webgen.webgen_backend.account.service.StripeAccountDeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StripeAccountDeletionServiceImpl implements StripeAccountDeletionService {

    private static final String RESOURCE_MISSING = "resource_missing";

    private final StripeCustomerDeletionGateway stripeCustomerDeletionGateway;

    @Override
    public void deleteCustomer(String stripeCustomerId) {
        if (!StringUtils.hasText(stripeCustomerId)) {
            return;
        }

        try {
            Customer deletedCustomer = stripeCustomerDeletionGateway
                    .deleteCustomer(stripeCustomerId.trim());
            if (deletedCustomer == null || !Boolean.TRUE.equals(deletedCustomer.getDeleted())) {
                throw stripeCleanupFailure(null);
            }
        } catch (InvalidRequestException exception) {
            if (isMissingCustomer(exception)) {
                return;
            }
            throw stripeCleanupFailure(exception);
        } catch (StripeException exception) {
            throw stripeCleanupFailure(exception);
        }
    }

    private boolean isMissingCustomer(InvalidRequestException exception) {
        return RESOURCE_MISSING.equals(exception.getCode())
                || Integer.valueOf(404).equals(exception.getStatusCode());
    }

    private ResponseStatusException stripeCleanupFailure(Exception cause) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Unable to remove Stripe billing customer",
                cause
        );
    }
}
