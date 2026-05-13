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
        name = "agent_messages",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(name = "agent_messages_unique_session_sequence", columnNames = {"session_id", "sequence_no"})
        },
        indexes = {
                @Index(name = "agent_messages_session_created_at_idx", columnList = "session_id, created_at")
        }
)
@NoArgsConstructor
@Getter
@Setter
public class AgentMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "sequence_no", nullable = false)
    private Long sequenceNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AgentMessageRole role;

    @Column(name = "content")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb")
    private JsonNode contentJson;

    @Column(name = "tool_name")
    private String toolName;

    @Column(name = "tool_call_id")
    private String toolCallId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
