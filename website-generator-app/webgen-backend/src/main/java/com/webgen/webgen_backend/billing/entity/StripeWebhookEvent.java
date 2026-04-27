package com.webgen.webgen_backend.billing.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stripe_webhook_events", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class StripeWebhookEvent {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "stripe_event_id", nullable = false)
    private String stripeEventId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private JsonNode payload;

    @Column(name = "processed_at", nullable = false)
    private OffsetDateTime processedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
