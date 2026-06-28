package com.webgen.webgen_backend.notification.repository;

import com.webgen.webgen_backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @EntityGraph(attributePaths = {"actorProfile", "portfolio", "comment"})
    Page<Notification> findByRecipientProfile_IdOrderByCreatedAtDesc(
            UUID recipientProfileId,
            Pageable pageable);

    @EntityGraph(attributePaths = {"actorProfile", "portfolio", "comment"})
    Optional<Notification> findByIdAndRecipientProfile_Id(UUID id, UUID recipientProfileId);

    Optional<Notification> findByDedupeKey(String dedupeKey);

    boolean existsByRecipientProfile_IdAndActorProfile_IdAndTypeAndCreatedAtAfter(
            UUID recipientProfileId,
            UUID actorProfileId,
            String type,
            OffsetDateTime createdAt);

    long countByRecipientProfile_IdAndReadAtIsNull(UUID recipientProfileId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Notification n
            set n.readAt = :readAt
            where n.recipientProfile.id = :recipientProfileId
              and n.readAt is null
            """)
    int markUnreadNotificationsRead(UUID recipientProfileId, OffsetDateTime readAt);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            insert into public.notifications (
                id,
                recipient_profile_id,
                actor_profile_id,
                type,
                portfolio_id,
                comment_id,
                dedupe_key,
                metadata,
                created_at
            )
            values (
                :id,
                :recipientProfileId,
                :actorProfileId,
                :type,
                :portfolioId,
                :commentId,
                :dedupeKey,
                CAST(:metadataJson AS jsonb),
                :createdAt
            )
            on conflict (dedupe_key) do nothing
            """, nativeQuery = true)
    int insertIgnore(
            UUID id,
            UUID recipientProfileId,
            UUID actorProfileId,
            String type,
            UUID portfolioId,
            UUID commentId,
            String dedupeKey,
            String metadataJson,
            OffsetDateTime createdAt);
}
