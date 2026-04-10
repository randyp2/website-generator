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
@Table(name = "resumes", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class Resume {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "raw_file_url")
    private String rawFileUrl;

    @Column(name = "raw_file_bucket")
    private String rawFileBucket;

    @Column(name = "raw_file_path")
    private String rawFilePath;

    @Column(name = "extracted_text")
    private String extractedText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_json")
    private JsonNode parsedJson;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
