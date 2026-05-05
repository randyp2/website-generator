package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.billing.entity.StripeWebhookEvent;
import com.webgen.webgen_backend.billing.repository.StripeWebhookEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeWebhookEventStateService {

    private static final String STATUS_PROCESSING = "processing";
    private static final String STATUS_PROCESSED = "processed";
    private static final String STATUS_FAILED = "failed";

    private static final int LAST_ERROR_MAX_LENGTH = 3_000;
    private static final long STALE_PROCESSING_TIMEOUT_MINUTES = 10L;

    private final StripeWebhookEventRepository stripeWebhookEventRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ClaimResult claimWebhookEvent(
            String stripeEventId,
            String eventType,
            JsonNode payloadJson
    ) {
        OffsetDateTime now = nowUtc();

        StripeWebhookEvent existing = stripeWebhookEventRepository
                .findByStripeEventIdForUpdate(stripeEventId)
                .orElse(null);

        if (existing == null) {
            StripeWebhookEvent candidate = new StripeWebhookEvent();
            candidate.setId(UUID.randomUUID());
            candidate.setStripeEventId(stripeEventId);
            candidate.setEventType(eventType);
            candidate.setPayload(payloadJson);
            candidate.setStatus(STATUS_PROCESSING);
            candidate.setLastError(null);
            candidate.setProcessingStartedAt(now);
            candidate.setProcessedAt(null);
            candidate.setCreatedAt(now);

            try {
                StripeWebhookEvent created = stripeWebhookEventRepository.saveAndFlush(candidate);
                return ClaimResult.claimed(created.getId());
            } catch (DataIntegrityViolationException exception) {
                existing = stripeWebhookEventRepository
                        .findByStripeEventIdForUpdate(stripeEventId)
                        .orElseThrow(() -> exception);
            }
        }

        String status = normalizeStatus(existing.getStatus());
        if (STATUS_PROCESSED.equals(status)) {
            return ClaimResult.duplicateProcessed(existing.getId());
        }

        if (STATUS_PROCESSING.equals(status) && !isStale(existing, now)) {
            return ClaimResult.duplicateInProgress(existing.getId());
        }

        existing.setEventType(eventType);
        existing.setPayload(payloadJson);
        existing.setStatus(STATUS_PROCESSING);
        existing.setLastError(null);
        existing.setProcessingStartedAt(now);
        existing.setProcessedAt(null);
        stripeWebhookEventRepository.save(existing);

        return ClaimResult.claimed(existing.getId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markProcessed(UUID webhookEventRowId) {
        if (webhookEventRowId == null) {
            return;
        }

        StripeWebhookEvent webhookEvent = stripeWebhookEventRepository
                .findByIdForUpdate(webhookEventRowId)
                .orElse(null);
        if (webhookEvent == null) {
            return;
        }

        webhookEvent.setStatus(STATUS_PROCESSED);
        webhookEvent.setLastError(null);
        webhookEvent.setProcessingStartedAt(null);
        webhookEvent.setProcessedAt(nowUtc());
        stripeWebhookEventRepository.save(webhookEvent);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(UUID webhookEventRowId, Throwable throwable) {
        if (webhookEventRowId == null) {
            return;
        }

        StripeWebhookEvent webhookEvent = stripeWebhookEventRepository
                .findByIdForUpdate(webhookEventRowId)
                .orElse(null);
        if (webhookEvent == null) {
            return;
        }

        webhookEvent.setStatus(STATUS_FAILED);
        webhookEvent.setLastError(truncateError(throwable));
        webhookEvent.setProcessingStartedAt(null);
        webhookEvent.setProcessedAt(null);
        stripeWebhookEventRepository.save(webhookEvent);
    }

    private boolean isStale(StripeWebhookEvent webhookEvent, OffsetDateTime now) {
        OffsetDateTime startedAt = webhookEvent.getProcessingStartedAt();
        if (startedAt == null) {
            startedAt = webhookEvent.getCreatedAt();
        }
        if (startedAt == null) {
            return true;
        }
        return startedAt.plusMinutes(STALE_PROCESSING_TIMEOUT_MINUTES).isBefore(now);
    }

    private String normalizeStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return "";
        }
        return status.trim().toLowerCase();
    }

    private String truncateError(Throwable throwable) {
        if (throwable == null) {
            return null;
        }

        String message = throwable.getMessage();
        if (!StringUtils.hasText(message)) {
            message = throwable.getClass().getSimpleName();
        }
        String normalized = message.trim();
        if (normalized.length() <= LAST_ERROR_MAX_LENGTH) {
            return normalized;
        }
        return normalized.substring(0, LAST_ERROR_MAX_LENGTH);
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    public enum ClaimOutcome {
        CLAIMED,
        DUPLICATE_PROCESSED,
        DUPLICATE_IN_PROGRESS
    }

    public record ClaimResult(UUID webhookEventRowId, ClaimOutcome outcome) {

        public static ClaimResult claimed(UUID rowId) {
            return new ClaimResult(rowId, ClaimOutcome.CLAIMED);
        }

        public static ClaimResult duplicateProcessed(UUID rowId) {
            return new ClaimResult(rowId, ClaimOutcome.DUPLICATE_PROCESSED);
        }

        public static ClaimResult duplicateInProgress(UUID rowId) {
            return new ClaimResult(rowId, ClaimOutcome.DUPLICATE_IN_PROGRESS);
        }
    }
}
