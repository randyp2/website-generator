package com.webgen.webgen_backend.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_verifications", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class EmailVerification {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "preview_file_content")
    private String previewFileContent;

    @Column(name = "preview_file_name")
    private String previewFileName;
}
