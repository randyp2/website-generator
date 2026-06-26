package com.webgen.webgen_backend.notification.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationDTO {
    private UUID id;
    private UUID recipientProfileId;
    private UUID actorProfileId;
    private String actorName;
    private String actorUsername;
    private String actorAvatarUrl;
    private String type;
    private UUID portfolioId;
    private String portfolioTitle;
    private String portfolioSlug;
    private UUID commentId;
    private JsonNode metadata;
    private boolean read;
    private OffsetDateTime readAt;
    private OffsetDateTime createdAt;
}
