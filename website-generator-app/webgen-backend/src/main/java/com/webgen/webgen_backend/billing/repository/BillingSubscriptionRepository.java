package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingSubscriptionRepository extends JpaRepository<BillingSubscription, UUID> {

    @Modifying
    @Query(value = """
            INSERT INTO public.billing_subscriptions AS bs (
                id,
                profile_id,
                stripe_customer_id,
                stripe_subscription_id,
                plan_key,
                price_id,
                status,
                current_period_start,
                current_period_end,
                cancel_at_period_end,
                canceled_at,
                metadata,
                created_at,
                updated_at
            ) VALUES (
                :id,
                :profileId,
                :stripeCustomerId,
                :stripeSubscriptionId,
                :planKey,
                :priceId,
                :status,
                :currentPeriodStart,
                :currentPeriodEnd,
                :cancelAtPeriodEnd,
                :canceledAt,
                CAST(:metadataJson AS jsonb),
                :createdAt,
                :updatedAt
            )
            ON CONFLICT (stripe_subscription_id) DO UPDATE
            SET profile_id = EXCLUDED.profile_id,
                stripe_customer_id = EXCLUDED.stripe_customer_id,
                plan_key = COALESCE(EXCLUDED.plan_key, bs.plan_key),
                price_id = COALESCE(EXCLUDED.price_id, bs.price_id),
                status = EXCLUDED.status,
                current_period_start = COALESCE(EXCLUDED.current_period_start, bs.current_period_start),
                current_period_end = COALESCE(EXCLUDED.current_period_end, bs.current_period_end),
                cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, bs.cancel_at_period_end),
                canceled_at = EXCLUDED.canceled_at,
                metadata = COALESCE(EXCLUDED.metadata, bs.metadata),
                updated_at = EXCLUDED.updated_at
            """, nativeQuery = true)
    void upsertByStripeSubscriptionId(
            @Param("id") UUID id,
            @Param("profileId") UUID profileId,
            @Param("stripeCustomerId") String stripeCustomerId,
            @Param("stripeSubscriptionId") String stripeSubscriptionId,
            @Param("planKey") String planKey,
            @Param("priceId") String priceId,
            @Param("status") String status,
            @Param("currentPeriodStart") OffsetDateTime currentPeriodStart,
            @Param("currentPeriodEnd") OffsetDateTime currentPeriodEnd,
            @Param("cancelAtPeriodEnd") Boolean cancelAtPeriodEnd,
            @Param("canceledAt") OffsetDateTime canceledAt,
            @Param("metadataJson") String metadataJson,
            @Param("createdAt") OffsetDateTime createdAt,
            @Param("updatedAt") OffsetDateTime updatedAt
    );

    Optional<BillingSubscription> findByStripeSubscriptionId(String stripeSubscriptionId);

    List<BillingSubscription> findByProfile_IdOrderByCurrentPeriodEndDesc(UUID profileId);

    Optional<BillingSubscription> findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc(
            UUID profileId,
            Collection<String> statuses
    );

    List<BillingSubscription> findByStripeCustomerIdAndStatusInOrderByCurrentPeriodEndDesc(
            String stripeCustomerId,
            Collection<String> statuses
    );
}
