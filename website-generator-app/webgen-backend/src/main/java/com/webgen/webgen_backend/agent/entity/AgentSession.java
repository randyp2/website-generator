package com.webgen.webgen_backend.agent.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "agent_sessions",
        schema = "public",
        indexes = {
                @Index(name = "agent_sessions_user_last_activity_idx", columnList = "user_id, last_activity_at"),
                @Index(name = "agent_sessions_portfolio_status_idx", columnList = "portfolio_id, status")
        }
)
@NoArgsConstructor
@Getter
@Setter
public class AgentSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AgentSessionStatus status = AgentSessionStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private AgentSessionStage stage = AgentSessionStage.DISCOVERY;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "memory_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode memoryJson = JsonNodeFactory.instance.objectNode();

    @Column(name = "current_job_id")
    private String currentJobId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "last_activity_at", nullable = false)
    private OffsetDateTime lastActivityAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (lastActivityAt == null) {
            lastActivityAt = now;
        }
        if (status == null) {
            status = AgentSessionStatus.ACTIVE;
        }
        if (stage == null) {
            stage = AgentSessionStage.DISCOVERY;
        }
        if (memoryJson == null) {
            memoryJson = JsonNodeFactory.instance.objectNode();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
