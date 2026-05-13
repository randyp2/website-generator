package com.webgen.webgen_backend.agent.entity;

import com.fasterxml.jackson.databind.JsonNode;
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
        name = "agent_runs",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(name = "agent_runs_unique_session_user_message", columnNames = {"session_id", "user_message_id"}),
                @UniqueConstraint(name = "agent_runs_assistant_message_unique", columnNames = {"assistant_message_id"})
        },
        indexes = {
                @Index(name = "agent_runs_session_status_started_idx", columnList = "session_id, status, started_at")
        }
)
@NoArgsConstructor
@Getter
@Setter
public class AgentRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "user_message_id", nullable = false)
    private UUID userMessageId;

    @Column(name = "assistant_message_id")
    private UUID assistantMessageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AgentRunStatus status = AgentRunStatus.RUNNING;

    @Column(name = "model")
    private String model;

    @Column(name = "input_tokens")
    private Integer inputTokens;

    @Column(name = "output_tokens")
    private Integer outputTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_request_json", columnDefinition = "jsonb")
    private JsonNode rawRequestJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response_json", columnDefinition = "jsonb")
    private JsonNode rawResponseJson;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

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
            status = AgentRunStatus.RUNNING;
        }
    }
}
