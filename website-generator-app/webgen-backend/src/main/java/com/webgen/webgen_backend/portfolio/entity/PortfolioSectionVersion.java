package com.webgen.webgen_backend.portfolio.entity;

import com.fasterxml.jackson.databind.JsonNode;
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

import com.webgen.webgen_backend.profile.entity.Profile;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_section_versions", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class PortfolioSectionVersion {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private PortfolioSection section;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", nullable = false)
    private JsonNode contentJson;

    @Column(name = "react_source")
    private String reactSource;

    @Column(name = "prompt_used")
    private String promptUsed;

    @Column(name = "model_used")
    private String modelUsed;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "created_by")
    private Profile createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
