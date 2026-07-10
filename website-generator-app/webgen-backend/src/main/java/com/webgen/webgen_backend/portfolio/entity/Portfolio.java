package com.webgen.webgen_backend.portfolio.entity;
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
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "portfolios", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class Portfolio {
    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "title")
    private String title;

    @Column(name = "template_id")
    private String templateId;

    @Column(name = "status")
    private String status;

    @Column(name = "slug")
    private String slug;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "active_version_id")
    private UUID activeVersionId;

    @Column(name = "last_step", nullable = false)
    private String lastStep;

    @Column(name = "screenshot_url")
    private String screenshotUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "style_chat_history", nullable = false)
    private List<StyleChatMessage> styleChatHistory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "refine_chat_history", nullable = false)
    private List<RefineChatMessage> refineChatHistory;

    @Column(name = "description")
    private String description;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "external_url")
    private String externalUrl;
}
