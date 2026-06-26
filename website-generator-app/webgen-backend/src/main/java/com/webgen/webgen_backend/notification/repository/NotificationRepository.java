package com.webgen.webgen_backend.notification.repository;

import com.webgen.webgen_backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @EntityGraph(attributePaths = {"actorProfile", "portfolio", "comment"})
    Page<Notification> findByRecipientProfile_IdOrderByCreatedAtDesc(
            UUID recipientProfileId,
            Pageable pageable);

    Optional<Notification> findByIdAndRecipientProfile_Id(UUID id, UUID recipientProfileId);

    Optional<Notification> findByDedupeKey(String dedupeKey);

    long countByRecipientProfile_IdAndReadAtIsNull(UUID recipientProfileId);
}
