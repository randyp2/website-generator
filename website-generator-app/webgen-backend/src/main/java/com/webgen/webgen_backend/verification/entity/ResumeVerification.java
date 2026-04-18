package com.webgen.webgen_backend.verification.entity;

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
@Table(name = "resume_verifications", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class ResumeVerification {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "raw_file_bucket")
    private String rawFileBucket;

    @Column(name = "raw_file_path")
    private String rawFilePath;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "extracted_text")
    private String extractedText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_json")
    private JsonNode parsedJson;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
