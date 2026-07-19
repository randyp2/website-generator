package com.webgen.webgen_backend.billing.model.webhook;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StripeWebhookEventTypeTest {

    @Test
    void recognizesCheckoutPaymentLifecycleEvents() {
        assertThat(StripeWebhookEventType.fromValue("checkout.session.completed"))
                .contains(StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED);
        assertThat(StripeWebhookEventType.fromValue("checkout.session.async_payment_succeeded"))
                .contains(StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED);
        assertThat(StripeWebhookEventType.fromValue("checkout.session.async_payment_failed"))
                .contains(StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_FAILED);
    }
}
