package com.webgen.webgen_backend.billing.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.profile.entity.Profile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Durable email eligibility and claim state for a one-time billing promotion.
 */
@Entity
@Table(name = "billing_promotion_eligibilities", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class BillingPromotionEligibility {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "campaign_key", nullable = false)
    private String campaignKey;

    @Column(name = "normalized_email", nullable = false)
    private String normalizedEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimed_profile_id")
    private Profile claimedProfile;

    @Column(name = "claimed_at")
    private OffsetDateTime claimedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "jsonb")
    private JsonNode metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
