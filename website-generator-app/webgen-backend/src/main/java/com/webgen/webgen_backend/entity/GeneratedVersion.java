package com.webgen.webgen_backend.entity;

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

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "generated_versions", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class GeneratedVersion {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "html", nullable = false)
    private String html;

    @Column(name = "css")
    private String css;

    @Column(name = "preview_url")
    private String previewUrl;

    @Column(name = "prompt_used")
    private String promptUsed;

    @Column(name = "model_used")
    private String modelUsed;

    @Column(name = "react_source")
    private String reactSource;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sections_snapshot")
    private JsonNode sectionsSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "assistant_message")
    private JsonNode assistantMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "global_theme")
    private JsonNode globalTheme;
}
