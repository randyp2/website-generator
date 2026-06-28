package com.webgen.webgen_backend.notification.entity;

import com.webgen.webgen_backend.profile.entity.Profile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "notification_email_deliveries",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "notification_email_deliveries_notification_provider_key",
                        columnNames = {"notification_id", "provider"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class NotificationEmailDelivery {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_profile_id", nullable = false)
    private Profile recipientProfile;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_message_id")
    private String providerMessageId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "next_attempt_at", nullable = false)
    private OffsetDateTime nextAttemptAt;

    @Column(name = "last_attempt_at")
    private OffsetDateTime lastAttemptAt;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "failed_at")
    private OffsetDateTime failedAt;

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
