package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.StripeWebhookEvent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StripeWebhookEventRepository extends JpaRepository<StripeWebhookEvent, UUID> {

    boolean existsByStripeEventId(String stripeEventId);

    Optional<StripeWebhookEvent> findByStripeEventId(String stripeEventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT e
        FROM StripeWebhookEvent e
        WHERE e.stripeEventId = :stripeEventId
    """)
    Optional<StripeWebhookEvent> findByStripeEventIdForUpdate(
            @Param("stripeEventId") String stripeEventId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT e
        FROM StripeWebhookEvent e
        WHERE e.id = :id
    """)
    Optional<StripeWebhookEvent> findByIdForUpdate(@Param("id") UUID id);
}
