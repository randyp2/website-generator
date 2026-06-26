package com.webgen.webgen_backend.notification.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.repository.NotificationRepository;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioComment;
import com.webgen.webgen_backend.profile.entity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public NotificationListResponseDTO listNotifications(
            UUID recipientProfileId,
            Integer page,
            Integer size) {
        if (recipientProfileId == null) {
            return NotificationListResponseDTO.builder()
                    .notifications(List.of())
                    .build();
        }

        List<NotificationDTO> notifications = notificationRepository
                .findByRecipientProfile_IdOrderByCreatedAtDesc(
                        recipientProfileId,
                        PageRequest.of(normalizePage(page), normalizeSize(size)))
                .stream()
                .map(this::toDto)
                .toList();

        return NotificationListResponseDTO.builder()
                .notifications(notifications)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(UUID recipientProfileId) {
        if (recipientProfileId == null) {
            return 0;
        }
        return notificationRepository.countByRecipientProfile_IdAndReadAtIsNull(recipientProfileId);
    }

    @Override
    @Transactional
    public NotificationDTO markRead(UUID recipientProfileId, UUID notificationId) {
        Notification notification = findOwnedNotification(recipientProfileId, notificationId);
        if (notification.getReadAt() == null) {
            notification.setReadAt(nowUtc());
            notification = notificationRepository.save(notification);
        }
        return toDto(notification);
    }

    @Override
    @Transactional
    public int markAllRead(UUID recipientProfileId) {
        if (recipientProfileId == null) {
            return 0;
        }
        return notificationRepository.markUnreadNotificationsRead(recipientProfileId, nowUtc());
    }

    @Override
    @Transactional
    public Optional<NotificationDTO> createNotification(
            UUID recipientProfileId,
            UUID actorProfileId,
            String type,
            UUID portfolioId,
            UUID commentId,
            String dedupeKey,
            JsonNode metadata) {
        if (recipientProfileId == null || portfolioId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification recipient and portfolio are required");
        }
        if (actorProfileId != null && actorProfileId.equals(recipientProfileId)) {
            return Optional.empty();
        }

        String normalizedType = normalizeType(type, commentId);
        String normalizedDedupeKey = normalizeOptionalText(dedupeKey);
        if (normalizedDedupeKey != null && notificationRepository.findByDedupeKey(normalizedDedupeKey).isPresent()) {
            return Optional.empty();
        }

        UUID notificationId = UUID.randomUUID();
        int inserted = notificationRepository.insertIgnore(
                notificationId,
                recipientProfileId,
                actorProfileId,
                normalizedType,
                portfolioId,
                commentId,
                normalizedDedupeKey,
                metadataJson(objectOrEmpty(metadata)),
                nowUtc());

        if (inserted == 0) {
            return Optional.empty();
        }

        return notificationRepository.findByIdAndRecipientProfile_Id(notificationId, recipientProfileId)
                .map(this::toDto);
    }

    private Notification findOwnedNotification(UUID recipientProfileId, UUID notificationId) {
        if (recipientProfileId == null || notificationId == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }

        return notificationRepository.findByIdAndRecipientProfile_Id(notificationId, recipientProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    private NotificationDTO toDto(Notification notification) {
        Profile recipient = notification.getRecipientProfile();
        Profile actor = notification.getActorProfile();
        Portfolio portfolio = notification.getPortfolio();
        PortfolioComment comment = notification.getComment();

        return NotificationDTO.builder()
                .id(notification.getId())
                .recipientProfileId(recipient == null ? null : recipient.getId())
                .actorProfileId(actor == null ? null : actor.getId())
                .actorName(actor == null ? null : actor.getFullName())
                .actorUsername(actor == null ? null : actor.getUsername())
                .actorAvatarUrl(actor == null ? null : actor.getAvatarUrl())
                .type(notification.getType())
                .portfolioId(portfolio == null ? null : portfolio.getId())
                .portfolioTitle(portfolio == null ? null : portfolio.getTitle())
                .portfolioSlug(portfolio == null ? null : portfolio.getSlug())
                .commentId(comment == null ? null : comment.getId())
                .metadata(objectOrEmpty(notification.getMetadata()))
                .read(notification.getReadAt() != null)
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private String normalizeType(String type, UUID commentId) {
        if (!StringUtils.hasText(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification type is required");
        }

        String normalized = type.trim().toLowerCase(Locale.ROOT);
        if (TYPE_PORTFOLIO_LIKED.equals(normalized)) {
            if (commentId != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portfolio like notifications cannot target a comment");
            }
            return normalized;
        }

        if (TYPE_PORTFOLIO_COMMENTED.equals(normalized)
                || TYPE_COMMENT_REPLIED.equals(normalized)
                || TYPE_COMMENT_LIKED.equals(normalized)) {
            if (commentId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment notifications require a comment");
            }
            return normalized;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported notification type");
    }

    private JsonNode objectOrEmpty(JsonNode candidate) {
        if (candidate != null && candidate.isObject()) {
            return candidate;
        }
        return objectMapper.createObjectNode();
    }

    private String metadataJson(JsonNode metadata) {
        try {
            return objectMapper.writeValueAsString(objectOrEmpty(metadata));
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to serialize notification metadata",
                    exception
            );
        }
    }

    private String normalizeOptionalText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private int normalizePage(Integer page) {
        if (page == null || page < 0) {
            return DEFAULT_PAGE;
        }
        return page;
    }

    private int normalizeSize(Integer size) {
        if (size == null || size <= 0) {
            return DEFAULT_SIZE;
        }
        return Math.min(size, MAX_SIZE);
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
