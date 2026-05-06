package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingInvoice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, UUID> {

    @Modifying
    @Query(value = """
            INSERT INTO public.billing_invoices AS bi (
                id,
                profile_id,
                stripe_invoice_id,
                stripe_customer_id,
                stripe_subscription_id,
                event_type,
                status,
                amount_paid,
                amount_due,
                currency,
                billing_reason,
                plan_key,
                price_id,
                hosted_invoice_url,
                invoice_pdf_url,
                current_period_start,
                current_period_end,
                metadata,
                occurred_at,
                created_at,
                updated_at
            ) VALUES (
                :id,
                :profileId,
                :stripeInvoiceId,
                :stripeCustomerId,
                :stripeSubscriptionId,
                :eventType,
                :status,
                :amountPaid,
                :amountDue,
                :currency,
                :billingReason,
                :planKey,
                :priceId,
                :hostedInvoiceUrl,
                :invoicePdfUrl,
                :currentPeriodStart,
                :currentPeriodEnd,
                CAST(:metadataJson AS jsonb),
                :occurredAt,
                :createdAt,
                :updatedAt
            )
            ON CONFLICT (stripe_invoice_id) DO UPDATE
            SET profile_id = EXCLUDED.profile_id,
                stripe_customer_id = EXCLUDED.stripe_customer_id,
                stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, bi.stripe_subscription_id),
                event_type = EXCLUDED.event_type,
                status = COALESCE(EXCLUDED.status, bi.status),
                amount_paid = COALESCE(EXCLUDED.amount_paid, bi.amount_paid),
                amount_due = COALESCE(EXCLUDED.amount_due, bi.amount_due),
                currency = COALESCE(EXCLUDED.currency, bi.currency),
                billing_reason = COALESCE(EXCLUDED.billing_reason, bi.billing_reason),
                plan_key = COALESCE(EXCLUDED.plan_key, bi.plan_key),
                price_id = COALESCE(EXCLUDED.price_id, bi.price_id),
                hosted_invoice_url = COALESCE(EXCLUDED.hosted_invoice_url, bi.hosted_invoice_url),
                invoice_pdf_url = COALESCE(EXCLUDED.invoice_pdf_url, bi.invoice_pdf_url),
                current_period_start = COALESCE(EXCLUDED.current_period_start, bi.current_period_start),
                current_period_end = COALESCE(EXCLUDED.current_period_end, bi.current_period_end),
                metadata = COALESCE(EXCLUDED.metadata, bi.metadata),
                occurred_at = COALESCE(EXCLUDED.occurred_at, bi.occurred_at),
                created_at = bi.created_at,
                updated_at = EXCLUDED.updated_at
            """, nativeQuery = true)
    void upsertByStripeInvoiceId(
            @Param("id") UUID id,
            @Param("profileId") UUID profileId,
            @Param("stripeInvoiceId") String stripeInvoiceId,
            @Param("stripeCustomerId") String stripeCustomerId,
            @Param("stripeSubscriptionId") String stripeSubscriptionId,
            @Param("eventType") String eventType,
            @Param("status") String status,
            @Param("amountPaid") Long amountPaid,
            @Param("amountDue") Long amountDue,
            @Param("currency") String currency,
            @Param("billingReason") String billingReason,
            @Param("planKey") String planKey,
            @Param("priceId") String priceId,
            @Param("hostedInvoiceUrl") String hostedInvoiceUrl,
            @Param("invoicePdfUrl") String invoicePdfUrl,
            @Param("currentPeriodStart") OffsetDateTime currentPeriodStart,
            @Param("currentPeriodEnd") OffsetDateTime currentPeriodEnd,
            @Param("metadataJson") String metadataJson,
            @Param("occurredAt") OffsetDateTime occurredAt,
            @Param("createdAt") OffsetDateTime createdAt,
            @Param("updatedAt") OffsetDateTime updatedAt
    );

    List<BillingInvoice> findByProfile_IdOrderByOccurredAtDescUpdatedAtDesc(
            UUID profileId,
            Pageable pageable
    );
}
