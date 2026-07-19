package com.webgen.webgen_backend.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Read model for a fulfilled credit-pack purchase stored in the credit ledger. */
@Data
@Builder
public class BillingCreditPurchaseDTO {

    private UUID ledgerEntryId;
    private String checkoutSessionId;
    private String paymentIntentId;
    private String paymentStatus;
    private String priceKey;
    private String priceId;
    private Integer credits;
    private Long amountPaid;
    private String currency;
    private OffsetDateTime purchasedAt;
}
