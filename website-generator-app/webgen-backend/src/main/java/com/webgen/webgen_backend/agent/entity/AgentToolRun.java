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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "agent_tool_runs",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(name = "agent_tool_runs_session_idempotency_key_unique", columnNames = {"session_id", "idempotency_key"})
        },
        indexes = {
                @Index(name = "agent_tool_runs_agent_run_status_idx", columnList = "agent_run_id, status"),
                @Index(name = "agent_tool_runs_session_started_idx", columnList = "session_id, started_at")
        }
)
@NoArgsConstructor
@Getter
@Setter
public class AgentToolRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "agent_run_id", nullable = false)
    private UUID agentRunId;

    @Column(name = "tool_name", nullable = false)
    private String toolName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AgentToolRunStatus status = AgentToolRunStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "args_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode argsJson = JsonNodeFactory.instance.objectNode();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result_json", columnDefinition = "jsonb")
    private JsonNode resultJson;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @PrePersist
    void onCreate() {
        if (startedAt == null) {
            startedAt = OffsetDateTime.now();
        }
        if (status == null) {
            status = AgentToolRunStatus.PENDING;
        }
        if (argsJson == null) {
            argsJson = JsonNodeFactory.instance.objectNode();
        }
    }
}
