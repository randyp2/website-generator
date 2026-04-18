package com.webgen.webgen_backend.verification.entity;

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

import com.webgen.webgen_backend.profile.entity.Profile;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "evidence", schema = "public")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Evidence {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "evidence_type", nullable = false)
    private String evidenceType;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "occurred_at")
    private OffsetDateTime occurredAt;

    @Column(name = "captured_at", nullable = false)
    private OffsetDateTime capturedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", nullable = false, columnDefinition = "jsonb")
    private JsonNode metadata;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
