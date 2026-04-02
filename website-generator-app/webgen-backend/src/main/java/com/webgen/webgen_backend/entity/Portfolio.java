package com.webgen.webgen_backend.entity;

import com.webgen.webgen_backend.entity.portfolio.StyleChatMessage;
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
    // Column | Type | Collation | Nullable | Default
    // --------------------+--------------------------+-----------+----------+-------------------
    // id | uuid | | not null | gen_random_uuid()
    // user_id | uuid | | not null |
    // title | text | | |
    // template_id | text | | |
    // status | text | | | 'draft'::text
    // slug | text | | |
    // created_at | timestamp with time zone | | | now()
    // updated_at | timestamp with time zone | | | now()
    // active_version_id | uuid | | |
    // last_step | text | | not null | 'template'::text
    // style_chat_history | jsonb | | not null | '[]'::jsonb
    //
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
}
