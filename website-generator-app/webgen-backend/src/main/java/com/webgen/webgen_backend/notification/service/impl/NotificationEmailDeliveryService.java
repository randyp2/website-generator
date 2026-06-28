package com.webgen.webgen_backend.notification.service.impl;

import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.repository.NotificationEmailDeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationEmailDeliveryService {

    public static final String PROVIDER_RESEND = "resend";
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_PROCESSING = "processing";
    public static final String STATUS_SENT = "sent";
    public static final String STATUS_FAILED = "failed";
    public static final String STATUS_SKIPPED = "skipped";

    private static final int DEFAULT_DUE_DELIVERY_LIMIT = 100;
    private static final int MAX_DUE_DELIVERY_LIMIT = 500;
    private static final int MAX_LAST_ERROR_LENGTH = 2000;

    private final NotificationEmailDeliveryRepository notificationEmailDeliveryRepository;

    @Transactional
    public Optional<UUID> createPendingDelivery(UUID notificationId, UUID recipientProfileId) {
        Assert.notNull(notificationId, "Notification id is required");
        Assert.notNull(recipientProfileId, "Recipient profile id is required");

        UUID deliveryId = UUID.randomUUID();
        OffsetDateTime now = nowUtc();

        int inserted = notificationEmailDeliveryRepository.insertIgnore(
                deliveryId,
                notificationId,
                recipientProfileId,
                PROVIDER_RESEND,
                STATUS_PENDING,
                now,
                now,
                now
        );

        return inserted == 1 ? Optional.of(deliveryId) : Optional.empty();
    }

    @Transactional(readOnly = true)
    public List<NotificationEmailDelivery> findDuePendingDeliveries(int limit) {
        return notificationEmailDeliveryRepository.findDueDeliveries(
                STATUS_PENDING,
                nowUtc(),
                PageRequest.of(0, normalizeLimit(limit))
        );
    }

    @Transactional
    public Optional<NotificationEmailDelivery> markProcessing(UUID deliveryId) {
        Assert.notNull(deliveryId, "Delivery id is required");

        OffsetDateTime now = nowUtc();
        return notificationEmailDeliveryRepository.findByIdForUpdate(deliveryId)
                .filter(delivery -> STATUS_PENDING.equals(delivery.getStatus()))
                .filter(delivery -> !delivery.getNextAttemptAt().isAfter(now))
                .map(delivery -> {
                    delivery.setStatus(STATUS_PROCESSING);
                    delivery.setAttemptCount(safeAttemptCount(delivery) + 1);
                    delivery.setLastAttemptAt(now);
                    delivery.setFailedAt(null);
                    delivery.setLastError(null);
                    return notificationEmailDeliveryRepository.save(delivery);
                });
    }

    @Transactional
    public Optional<NotificationEmailDelivery> markSent(UUID deliveryId, String providerMessageId) {
        Assert.notNull(deliveryId, "Delivery id is required");
        String normalizedProviderMessageId = requireText(providerMessageId, "Provider message id is required");

        OffsetDateTime now = nowUtc();
        return notificationEmailDeliveryRepository.findByIdForUpdate(deliveryId)
                .filter(delivery -> STATUS_PROCESSING.equals(delivery.getStatus()))
                .map(delivery -> {
                    delivery.setStatus(STATUS_SENT);
                    delivery.setProviderMessageId(normalizedProviderMessageId);
                    delivery.setSentAt(now);
                    delivery.setFailedAt(null);
                    delivery.setLastError(null);
                    return notificationEmailDeliveryRepository.save(delivery);
                });
    }

    @Transactional
    public Optional<NotificationEmailDelivery> markPendingRetry(
            UUID deliveryId,
            String lastError,
            OffsetDateTime nextAttemptAt) {
        Assert.notNull(deliveryId, "Delivery id is required");
        Assert.notNull(nextAttemptAt, "Next attempt time is required");

        return notificationEmailDeliveryRepository.findByIdForUpdate(deliveryId)
                .filter(delivery -> STATUS_PROCESSING.equals(delivery.getStatus()))
                .map(delivery -> {
                    delivery.setStatus(STATUS_PENDING);
                    delivery.setNextAttemptAt(nextAttemptAt);
                    delivery.setFailedAt(null);
                    delivery.setLastError(normalizeLastError(lastError));
                    return notificationEmailDeliveryRepository.save(delivery);
                });
    }

    @Transactional
    public Optional<NotificationEmailDelivery> markFailed(UUID deliveryId, String lastError) {
        Assert.notNull(deliveryId, "Delivery id is required");

        OffsetDateTime now = nowUtc();
        return notificationEmailDeliveryRepository.findByIdForUpdate(deliveryId)
                .filter(delivery -> STATUS_PROCESSING.equals(delivery.getStatus()))
                .map(delivery -> {
                    delivery.setStatus(STATUS_FAILED);
                    delivery.setFailedAt(now);
                    delivery.setLastError(normalizeLastError(lastError));
                    return notificationEmailDeliveryRepository.save(delivery);
                });
    }

    @Transactional
    public Optional<NotificationEmailDelivery> markSkipped(UUID deliveryId, String reason) {
        Assert.notNull(deliveryId, "Delivery id is required");

        return notificationEmailDeliveryRepository.findByIdForUpdate(deliveryId)
                .filter(delivery -> STATUS_PENDING.equals(delivery.getStatus())
                        || STATUS_PROCESSING.equals(delivery.getStatus()))
                .map(delivery -> {
                    delivery.setStatus(STATUS_SKIPPED);
                    delivery.setFailedAt(null);
                    delivery.setLastError(normalizeLastError(reason));
                    return notificationEmailDeliveryRepository.save(delivery);
                });
    }

    private int normalizeLimit(int limit) {
        if (limit <= 0) {
            return DEFAULT_DUE_DELIVERY_LIMIT;
        }
        return Math.min(limit, MAX_DUE_DELIVERY_LIMIT);
    }

    private int safeAttemptCount(NotificationEmailDelivery delivery) {
        Integer attemptCount = delivery.getAttemptCount();
        return attemptCount == null ? 0 : attemptCount;
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String normalizeLastError(String lastError) {
        if (!StringUtils.hasText(lastError)) {
            return null;
        }

        String normalized = lastError.trim();
        if (normalized.length() <= MAX_LAST_ERROR_LENGTH) {
            return normalized;
        }
        return normalized.substring(0, MAX_LAST_ERROR_LENGTH);
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}
