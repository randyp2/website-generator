package com.webgen.webgen_backend.verification.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.verification.entity.VerificationOutboxEvent;
import com.webgen.webgen_backend.verification.repository.VerificationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/** Publishes committed outbox events with bounded exponential backoff. */
@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationOutboxPublisher {
    private static final int MAX_ATTEMPTS = 8;
    private final VerificationOutboxRepository outboxRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${verification.outbox.poll-ms:1000}")
    @Transactional
    public void publishAvailable() {
        outboxRepository.findTop25ByStatusAndAvailableAtLessThanEqualOrderByCreatedAtAsc(
                "pending", OffsetDateTime.now()).forEach(this::publish);
    }

    void publish(VerificationOutboxEvent event) {
        try {
            AssetVerificationMessage message = objectMapper.treeToValue(event.getPayload(), AssetVerificationMessage.class);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ASSET_VERIFICATION_ROUTING_KEY, message);
            event.setStatus("published");
            event.setPublishedAt(OffsetDateTime.now());
            event.setLastError(null);
            log.info("Verification outbox published eventId={} jobId={} attempt={}",
                    event.getId(), message.getJobId(), event.getAttemptCount() + 1);
        } catch (Exception exception) {
            event.setAttemptCount(event.getAttemptCount() + 1);
            event.setLastError(abbreviate(exception.getMessage()));
            event.setStatus(event.getAttemptCount() >= MAX_ATTEMPTS ? "failed" : "pending");
            event.setAvailableAt(OffsetDateTime.now().plusSeconds(backoffSeconds(event.getAttemptCount())));
            log.warn("Verification outbox publish failed eventId={} attempt={} status={} reason={}",
                    event.getId(), event.getAttemptCount(), event.getStatus(), exception.getMessage());
        }
        event.setUpdatedAt(OffsetDateTime.now());
        outboxRepository.save(event);
    }

    private long backoffSeconds(int attempt) {
        return Math.min(300, 1L << Math.min(attempt, 8));
    }

    private String abbreviate(String value) {
        if (value == null) return "Unknown publication error";
        return value.substring(0, Math.min(500, value.length()));
    }
}
