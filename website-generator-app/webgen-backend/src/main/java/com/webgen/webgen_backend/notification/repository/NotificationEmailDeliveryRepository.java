package com.webgen.webgen_backend.notification.repository;

import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationEmailDeliveryRepository extends JpaRepository<NotificationEmailDelivery, UUID> {

    Optional<NotificationEmailDelivery> findByNotification_IdAndProvider(UUID notificationId, String provider);

    boolean existsByNotification_IdAndProvider(UUID notificationId, String provider);

    @Query("""
            select delivery
            from NotificationEmailDelivery delivery
            where delivery.status = :status
              and delivery.nextAttemptAt <= :now
            order by delivery.createdAt asc
            """)
    List<NotificationEmailDelivery> findDueDeliveries(String status, OffsetDateTime now, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select delivery
            from NotificationEmailDelivery delivery
            where delivery.id = :id
            """)
    Optional<NotificationEmailDelivery> findByIdForUpdate(UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            insert into public.notification_email_deliveries (
                id,
                notification_id,
                recipient_profile_id,
                provider,
                status,
                next_attempt_at,
                created_at,
                updated_at
            )
            values (
                :id,
                :notificationId,
                :recipientProfileId,
                :provider,
                :status,
                :nextAttemptAt,
                :createdAt,
                :updatedAt
            )
            on conflict (notification_id, provider) do nothing
            """, nativeQuery = true)
    int insertIgnore(
            UUID id,
            UUID notificationId,
            UUID recipientProfileId,
            String provider,
            String status,
            OffsetDateTime nextAttemptAt,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt);
}
