package com.webgen.webgen_backend.billing.model.webhook;

import java.util.Locale;
import java.util.Optional;

public enum StripeWebhookEventType {
    CHECKOUT_SESSION_COMPLETED("checkout.session.completed"),
    CUSTOMER_SUBSCRIPTION_CREATED("customer.subscription.created"),
    CUSTOMER_SUBSCRIPTION_UPDATED("customer.subscription.updated"),
    CUSTOMER_SUBSCRIPTION_DELETED("customer.subscription.deleted"),
    INVOICE_PAID("invoice.paid"),
    INVOICE_PAYMENT_FAILED("invoice.payment_failed");

    private final String value;

    StripeWebhookEventType(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static Optional<StripeWebhookEventType> fromValue(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        for (StripeWebhookEventType eventType : values()) {
            if (eventType.value.equals(normalized)) {
                return Optional.of(eventType);
            }
        }
        return Optional.empty();
    }
}
