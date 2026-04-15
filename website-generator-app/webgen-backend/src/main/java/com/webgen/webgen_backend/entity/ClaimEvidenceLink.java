package com.webgen.webgen_backend.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "claim_evidence_links", schema = "public")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ClaimEvidenceLink {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "evidence_id", nullable = false)
    private UUID evidenceId;

    @Column(name = "link_type", nullable = false)
    private String linkType;

    @Column(name = "link_confidence", nullable = false)
    private BigDecimal linkConfidence;

    @Column(name = "reason")
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "jsonb")
    private JsonNode metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
