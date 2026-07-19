package com.webgen.webgen_backend.billing.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.billing.entity.converter.CreditBucketConverter;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.profile.entity.Profile;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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

@Entity
@Table(name = "billing_credit_ledger_entries", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class BillingCreditLedgerEntry {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "delta_credits", nullable = false)
    private Integer deltaCredits;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "stripe_event_id")
    private String stripeEventId;

    @Column(name = "checkout_session_id")
    private String checkoutSessionId;

    @Column(name = "credit_operation_id")
    private UUID creditOperationId;

    @Convert(converter = CreditBucketConverter.class)
    @Column(name = "credit_bucket", nullable = false)
    private CreditBucket creditBucket = CreditBucket.GENERAL;

    @Column(name = "valid_from")
    private OffsetDateTime validFrom;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grant_entry_id")
    private BillingCreditLedgerEntry grantEntry;

    @Column(name = "grant_key")
    private String grantKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "jsonb")
    private JsonNode metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
