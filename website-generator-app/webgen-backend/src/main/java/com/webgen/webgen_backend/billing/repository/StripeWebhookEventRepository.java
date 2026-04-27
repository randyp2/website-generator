package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.StripeWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StripeWebhookEventRepository extends JpaRepository<StripeWebhookEvent, UUID> {

    boolean existsByStripeEventId(String stripeEventId);

    Optional<StripeWebhookEvent> findByStripeEventId(String stripeEventId);
}
