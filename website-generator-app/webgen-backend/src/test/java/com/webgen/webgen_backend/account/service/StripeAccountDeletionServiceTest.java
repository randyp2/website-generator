package com.webgen.webgen_backend.account.service;

import com.stripe.exception.ApiConnectionException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.webgen.webgen_backend.account.integration.StripeCustomerDeletionGateway;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StripeAccountDeletionServiceTest {

    @Test
    void deletesExistingStripeCustomer() throws Exception {
        Customer deletedCustomer = new Customer();
        deletedCustomer.setDeleted(true);
        RecordingGateway gateway = new RecordingGateway(deletedCustomer, null);
        StripeAccountDeletionService service = new StripeAccountDeletionService(gateway);

        service.deleteCustomer(" cus_account ");

        assertThat(gateway.stripeCustomerId).isEqualTo("cus_account");
    }

    @Test
    void missingCustomerIsAnIdempotentSuccess() throws Exception {
        InvalidRequestException missing = new InvalidRequestException(
                "No such customer",
                "id",
                "req_account",
                "resource_missing",
                404,
                null
        );
        RecordingGateway gateway = new RecordingGateway(null, missing);
        StripeAccountDeletionService service = new StripeAccountDeletionService(gateway);

        assertThatCode(() -> service.deleteCustomer("cus_missing"))
                .doesNotThrowAnyException();
    }

    @Test
    void transientStripeFailureStopsDeletionForRetry() throws Exception {
        RecordingGateway gateway = new RecordingGateway(
                null,
                new ApiConnectionException("Stripe unavailable")
        );
        StripeAccountDeletionService service = new StripeAccountDeletionService(gateway);

        assertThatThrownBy(() -> service.deleteCustomer("cus_account"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY)
                );
    }

    @Test
    void accountWithoutStripeCustomerRequiresNoStripeCall() {
        RecordingGateway gateway = new RecordingGateway(null, null);
        StripeAccountDeletionService service = new StripeAccountDeletionService(gateway);

        service.deleteCustomer(" ");

        assertThat(gateway.stripeCustomerId).isNull();
    }

    private static final class RecordingGateway extends StripeCustomerDeletionGateway {

        private final Customer response;
        private final StripeException exception;
        private String stripeCustomerId;

        private RecordingGateway(Customer response, StripeException exception) {
            super(null);
            this.response = response;
            this.exception = exception;
        }

        @Override
        public Customer deleteCustomer(String stripeCustomerId) throws StripeException {
            this.stripeCustomerId = stripeCustomerId;
            if (exception != null) {
                throw exception;
            }
            return response;
        }
    }
}
