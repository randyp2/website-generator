package com.webgen.webgen_backend.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;

import java.util.Optional;
import java.util.UUID;

public interface NotificationService {

    String TYPE_PORTFOLIO_LIKED = "portfolio_liked";
    String TYPE_PORTFOLIO_COMMENTED = "portfolio_commented";
    String TYPE_COMMENT_REPLIED = "comment_replied";
    String TYPE_COMMENT_LIKED = "comment_liked";

    NotificationListResponseDTO listNotifications(UUID recipientProfileId, Integer page, Integer size);

    long countUnread(UUID recipientProfileId);

    NotificationDTO markRead(UUID recipientProfileId, UUID notificationId);

    int markAllRead(UUID recipientProfileId);

    Optional<NotificationDTO> createNotification(
            UUID recipientProfileId,
            UUID actorProfileId,
            String type,
            UUID portfolioId,
            UUID commentId,
            String dedupeKey,
            JsonNode metadata);
}
