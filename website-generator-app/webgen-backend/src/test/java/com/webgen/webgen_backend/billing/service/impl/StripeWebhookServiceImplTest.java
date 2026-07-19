package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.net.Webhook;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.dto.BillingCreditPurchaseDTO;
import com.webgen.webgen_backend.billing.dto.BillingInvoiceDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessRequestDTO;
import com.webgen.webgen_backend.billing.dto.webhook.StripeWebhookProcessResponseDTO;
import com.webgen.webgen_backend.billing.model.webhook.StripeCheckoutSessionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeSubscriptionSnapshotModel;
import com.webgen.webgen_backend.billing.model.webhook.StripeWebhookEventType;
import com.webgen.webgen_backend.billing.service.BillingCreditLedgerService;
import com.webgen.webgen_backend.billing.service.BillingInvoiceService;
import com.webgen.webgen_backend.billing.service.BillingSubscriptionSyncService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StripeWebhookServiceImplTest {

    private static final String WEBHOOK_SECRET = "whsec_test_secret";

    private RecordingCreditLedgerService creditLedgerService;
    private RecordingWebhookEventStateService webhookEventStateService;
    private StripeWebhookServiceImpl service;

    @BeforeEach
    void setUp() {
        StripeProperties properties = new StripeProperties();
        properties.setWebhookSecret(WEBHOOK_SECRET);
        properties.getPrice().setCreditPackSmall("price_small");

        creditLedgerService = new RecordingCreditLedgerService();
        webhookEventStateService = new RecordingWebhookEventStateService();
        service = new StripeWebhookServiceImpl(
                properties,
                noOpSubscriptionSyncService(),
                creditLedgerService,
                noOpInvoiceService(),
                webhookEventStateService,
                noOpTransactionManager(),
                new ObjectMapper()
        );
    }

    @Test
    void dispatchesAsyncPaymentSuccessWithPaymentStatus() throws Exception {
        UUID profileId = UUID.randomUUID();
        String payload = checkoutEventPayload(
                "evt_async_success",
                "checkout.session.async_payment_succeeded",
                "cs_async",
                "paid",
                profileId
        );

        StripeWebhookProcessResponseDTO response = service.processWebhook(request(payload));

        assertThat(response.isProcessed()).isTrue();
        assertThat(response.isDuplicate()).isFalse();
        assertThat(creditLedgerService.snapshots).singleElement().satisfies(snapshot -> {
            assertThat(snapshot.getStripeEventId()).isEqualTo("evt_async_success");
            assertThat(snapshot.getEventType())
                    .isEqualTo(StripeWebhookEventType.CHECKOUT_SESSION_ASYNC_PAYMENT_SUCCEEDED);
            assertThat(snapshot.getCheckoutSessionId()).isEqualTo("cs_async");
            assertThat(snapshot.getPaymentStatus()).isEqualTo("paid");
            assertThat(snapshot.getProfileId()).isEqualTo(profileId);
            assertThat(snapshot.getPriceKey()).isEqualTo("CREDIT_PACK_SMALL");
            assertThat(snapshot.getPriceId()).isEqualTo("price_small");
            assertThat(snapshot.getPaymentIntentId()).isEqualTo("pi_test");
            assertThat(snapshot.getAmountTotal()).isEqualTo(1_200L);
            assertThat(snapshot.getCurrency()).isEqualTo("usd");
        });
        assertThat(webhookEventStateService.processedRowId).isNotNull();
    }

    @Test
    void dispatchesCompletedUnpaidSessionForSafeNoOpFulfillment() throws Exception {
        String payload = checkoutEventPayload(
                "evt_completed_unpaid",
                "checkout.session.completed",
                "cs_unpaid",
                "unpaid",
                UUID.randomUUID()
        );

        service.processWebhook(request(payload));

        assertThat(creditLedgerService.snapshots).singleElement().satisfies(snapshot -> {
            assertThat(snapshot.getEventType())
                    .isEqualTo(StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED);
            assertThat(snapshot.getPaymentStatus()).isEqualTo("unpaid");
        });
    }

    private StripeWebhookProcessRequestDTO request(String payload) throws Exception {
        long timestamp = Webhook.Util.getTimeNow();
        String signature = Webhook.Util.computeHmacSha256(
                WEBHOOK_SECRET,
                timestamp + "." + payload
        );
        StripeWebhookProcessRequestDTO request = new StripeWebhookProcessRequestDTO();
        request.setPayload(payload);
        request.setStripeSignature("t=" + timestamp + ",v1=" + signature);
        return request;
    }

    private String checkoutEventPayload(
            String eventId,
            String eventType,
            String checkoutSessionId,
            String paymentStatus,
            UUID profileId
    ) {
        return """
                {
                  "id": "%s",
                  "object": "event",
                  "created": %d,
                  "data": {
                    "object": {
                      "id": "%s",
                      "object": "checkout.session",
                      "client_reference_id": "%s",
                      "customer": "cus_test",
                      "payment_intent": "pi_test",
                      "payment_status": "%s",
                      "amount_total": 1200,
                      "currency": "usd",
                      "metadata": {
                        "profile_id": "%s",
                        "purchase_type": "credits",
                        "price_key": "CREDIT_PACK_SMALL"
                      }
                    }
                  },
                  "livemode": false,
                  "pending_webhooks": 1,
                  "type": "%s"
                }
                """.formatted(
                eventId,
                Instant.now().getEpochSecond(),
                checkoutSessionId,
                profileId,
                paymentStatus,
                profileId,
                eventType
        );
    }

    private BillingSubscriptionSyncService noOpSubscriptionSyncService() {
        return new BillingSubscriptionSyncService() {
            @Override
            public void syncSubscriptionSnapshot(StripeSubscriptionSnapshotModel snapshot) {
            }

            @Override
            public void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot) {
            }
        };
    }

    private BillingInvoiceService noOpInvoiceService() {
        return new BillingInvoiceService() {
            @Override
            public void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot) {
            }

            @Override
            public List<BillingInvoiceDTO> listRecentInvoices(UUID profileId, Integer limit) {
                return List.of();
            }
        };
    }

    private PlatformTransactionManager noOpTransactionManager() {
        return new PlatformTransactionManager() {
            @Override
            public TransactionStatus getTransaction(TransactionDefinition definition) {
                return new SimpleTransactionStatus();
            }

            @Override
            public void commit(TransactionStatus status) {
            }

            @Override
            public void rollback(TransactionStatus status) {
            }
        };
    }

    private static final class RecordingCreditLedgerService
            implements BillingCreditLedgerService {
        private final List<StripeCheckoutSessionSnapshotModel> snapshots = new ArrayList<>();

        @Override
        public void fulfillCheckoutSession(StripeCheckoutSessionSnapshotModel snapshot) {
            snapshots.add(snapshot);
        }

        @Override
        public void applyInvoicePaidAllowances(StripeInvoiceSnapshotModel snapshot) {
        }

        @Override
        public List<BillingCreditPurchaseDTO> listRecentCreditPurchases(
                UUID profileId,
                Integer limit
        ) {
            return List.of();
        }
    }

    private static final class RecordingWebhookEventStateService
            extends StripeWebhookEventStateService {
        private UUID processedRowId;

        private RecordingWebhookEventStateService() {
            super(null);
        }

        @Override
        public ClaimResult claimWebhookEvent(
                String stripeEventId,
                String eventType,
                com.fasterxml.jackson.databind.JsonNode payloadJson
        ) {
            return ClaimResult.claimed(UUID.randomUUID());
        }

        @Override
        public void markProcessed(UUID webhookEventRowId) {
            processedRowId = webhookEventRowId;
        }

        @Override
        public void markFailed(UUID webhookEventRowId, Throwable throwable) {
            throw new AssertionError("Webhook dispatch should not fail", throwable);
        }
    }
}
