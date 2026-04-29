package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingSubscriptionRepository extends JpaRepository<BillingSubscription, UUID> {

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
