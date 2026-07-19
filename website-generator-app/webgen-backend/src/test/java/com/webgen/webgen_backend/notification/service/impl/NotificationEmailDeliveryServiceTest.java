package com.webgen.webgen_backend.notification.service.impl;

import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.repository.NotificationEmailDeliveryRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationEmailDeliveryServiceTest {

    @Test
    void createPendingDeliveryInsertsResendPendingRow() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        UUID notificationId = UUID.randomUUID();
        UUID recipientProfileId = UUID.randomUUID();

        Optional<UUID> deliveryId = service.createPendingDelivery(notificationId, recipientProfileId);

        assertThat(deliveryId).isPresent();
        assertThat(repository.insertCalls).isEqualTo(1);
        NotificationEmailDelivery delivery = repository.deliveriesById.get(deliveryId.get());
        assertThat(delivery.getNotification().getId()).isEqualTo(notificationId);
        assertThat(delivery.getRecipientProfile().getId()).isEqualTo(recipientProfileId);
        assertThat(delivery.getProvider()).isEqualTo(NotificationEmailDeliveryService.PROVIDER_RESEND);
        assertThat(delivery.getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_PENDING);
        assertThat(delivery.getAttemptCount()).isZero();
        assertThat(delivery.getNextAttemptAt()).isNotNull();
        assertThat(delivery.getCreatedAt()).isNotNull();
        assertThat(delivery.getUpdatedAt()).isNotNull();
    }

    @Test
    void createPendingDeliveryReturnsEmptyForExistingNotificationProvider() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        UUID notificationId = UUID.randomUUID();
        UUID recipientProfileId = UUID.randomUUID();

        assertThat(service.createPendingDelivery(notificationId, recipientProfileId)).isPresent();
        assertThat(service.createPendingDelivery(notificationId, recipientProfileId)).isEmpty();

        assertThat(repository.insertCalls).isEqualTo(2);
        assertThat(repository.deliveriesById).hasSize(1);
    }

    @Test
    void findDuePendingDeliveriesDelegatesToRepositoryWithNormalizedLimit() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery dueDelivery = delivery(NotificationEmailDeliveryService.STATUS_PENDING);
        dueDelivery.setNextAttemptAt(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(1));
        repository.deliveriesById.put(dueDelivery.getId(), dueDelivery);

        List<NotificationEmailDelivery> deliveries = service.findDuePendingDeliveries(0);

        assertThat(deliveries).containsExactly(dueDelivery);
        assertThat(repository.lastDueStatus).isEqualTo(NotificationEmailDeliveryService.STATUS_PENDING);
        assertThat(repository.lastDuePageable.getPageSize()).isEqualTo(100);
    }

    @Test
    void markProcessingClaimsDuePendingDelivery() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery delivery = delivery(NotificationEmailDeliveryService.STATUS_PENDING);
        delivery.setAttemptCount(2);
        delivery.setNextAttemptAt(OffsetDateTime.now(ZoneOffset.UTC).minusSeconds(1));
        delivery.setFailedAt(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(5));
        delivery.setLastError("previous error");
        repository.deliveriesById.put(delivery.getId(), delivery);

        Optional<NotificationEmailDelivery> result = service.markProcessing(delivery.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_PROCESSING);
        assertThat(result.get().getAttemptCount()).isEqualTo(3);
        assertThat(result.get().getLastAttemptAt()).isNotNull();
        assertThat(result.get().getFailedAt()).isNull();
        assertThat(result.get().getLastError()).isNull();
        assertThat(repository.saveCalls).isEqualTo(1);
    }

    @Test
    void markProcessingSkipsFutureOrNonPendingDelivery() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery futurePending = delivery(NotificationEmailDeliveryService.STATUS_PENDING);
        futurePending.setNextAttemptAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(5));
        NotificationEmailDelivery processing = delivery(NotificationEmailDeliveryService.STATUS_PROCESSING);
        repository.deliveriesById.put(futurePending.getId(), futurePending);
        repository.deliveriesById.put(processing.getId(), processing);

        assertThat(service.markProcessing(futurePending.getId())).isEmpty();
        assertThat(service.markProcessing(processing.getId())).isEmpty();

        assertThat(repository.saveCalls).isZero();
    }

    @Test
    void markSentCompletesProcessingDelivery() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery delivery = delivery(NotificationEmailDeliveryService.STATUS_PROCESSING);
        repository.deliveriesById.put(delivery.getId(), delivery);

        Optional<NotificationEmailDelivery> result = service.markSent(delivery.getId(), " resend_message_123 ");

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_SENT);
        assertThat(result.get().getProviderMessageId()).isEqualTo("resend_message_123");
        assertThat(result.get().getSentAt()).isNotNull();
        assertThat(result.get().getFailedAt()).isNull();
        assertThat(result.get().getLastError()).isNull();
        assertThat(repository.saveCalls).isEqualTo(1);
    }

    @Test
    void markSentRequiresProviderMessageId() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());

        assertThatThrownBy(() -> service.markSent(UUID.randomUUID(), " "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Provider message id is required");
    }

    @Test
    void markPendingRetryReturnsProcessingDeliveryToPending() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery delivery = delivery(NotificationEmailDeliveryService.STATUS_PROCESSING);
        OffsetDateTime nextAttemptAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10);
        repository.deliveriesById.put(delivery.getId(), delivery);

        Optional<NotificationEmailDelivery> result = service.markPendingRetry(
                delivery.getId(),
                " temporary provider outage ",
                nextAttemptAt);

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_PENDING);
        assertThat(result.get().getNextAttemptAt()).isEqualTo(nextAttemptAt);
        assertThat(result.get().getFailedAt()).isNull();
        assertThat(result.get().getLastError()).isEqualTo("temporary provider outage");
        assertThat(repository.saveCalls).isEqualTo(1);
    }

    @Test
    void markFailedStoresTerminalFailure() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery delivery = delivery(NotificationEmailDeliveryService.STATUS_PROCESSING);
        repository.deliveriesById.put(delivery.getId(), delivery);

        Optional<NotificationEmailDelivery> result = service.markFailed(delivery.getId(), " provider rejected email ");

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_FAILED);
        assertThat(result.get().getFailedAt()).isNotNull();
        assertThat(result.get().getLastError()).isEqualTo("provider rejected email");
        assertThat(repository.saveCalls).isEqualTo(1);
    }

    @Test
    void markSkippedStoresSkipReasonForPendingDelivery() {
        RepositoryStub repository = new RepositoryStub();
        NotificationEmailDeliveryService service = new NotificationEmailDeliveryService(repository.proxy());
        NotificationEmailDelivery delivery = delivery(NotificationEmailDeliveryService.STATUS_PENDING);
        repository.deliveriesById.put(delivery.getId(), delivery);

        Optional<NotificationEmailDelivery> result = service.markSkipped(delivery.getId(), " recipient email missing ");

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(NotificationEmailDeliveryService.STATUS_SKIPPED);
        assertThat(result.get().getFailedAt()).isNull();
        assertThat(result.get().getLastError()).isEqualTo("recipient email missing");
        assertThat(repository.saveCalls).isEqualTo(1);
    }

    private NotificationEmailDelivery delivery(String status) {
        UUID deliveryId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Profile recipientProfile = new Profile();
        recipientProfile.setId(UUID.randomUUID());

        return NotificationEmailDelivery.builder()
                .id(deliveryId)
                .notification(Notification.builder()
                        .id(UUID.randomUUID())
                        .recipientProfile(recipientProfile)
                        .type("portfolio_liked")
                        .createdAt(now)
                        .build())
                .recipientProfile(recipientProfile)
                .provider(NotificationEmailDeliveryService.PROVIDER_RESEND)
                .status(status)
                .attemptCount(0)
                .nextAttemptAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName
            );
        };
    }

    private class RepositoryStub {
        private final Map<UUID, NotificationEmailDelivery> deliveriesById = new HashMap<>();
        private final Map<String, UUID> deliveryIdsByNotificationProvider = new HashMap<>();

        private int insertCalls;
        private int saveCalls;
        private String lastDueStatus;
        private Pageable lastDuePageable;

        private NotificationEmailDeliveryRepository proxy() {
            return (NotificationEmailDeliveryRepository) Proxy.newProxyInstance(
                    NotificationEmailDeliveryRepository.class.getClassLoader(),
                    new Class[]{NotificationEmailDeliveryRepository.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return handleObjectMethod(proxy, method.getName(), args);
                        }

                        return switch (method.getName()) {
                            case "insertIgnore" -> insertIgnore(args);
                            case "findDueDeliveries" -> findDueDeliveries(args);
                            case "findByIdForUpdate" -> Optional.ofNullable(deliveriesById.get((UUID) args[0]));
                            case "save" -> {
                                saveCalls++;
                                NotificationEmailDelivery delivery = (NotificationEmailDelivery) args[0];
                                deliveriesById.put(delivery.getId(), delivery);
                                yield delivery;
                            }
                            default -> throw new UnsupportedOperationException(
                                    "Unexpected repository method invocation: " + method.getName()
                            );
                        };
                    }
            );
        }

        private int insertIgnore(Object[] args) {
            insertCalls++;
            UUID deliveryId = (UUID) args[0];
            UUID notificationId = (UUID) args[1];
            UUID recipientProfileId = (UUID) args[2];
            String provider = (String) args[3];
            String status = (String) args[4];
            OffsetDateTime nextAttemptAt = (OffsetDateTime) args[5];
            OffsetDateTime createdAt = (OffsetDateTime) args[6];
            OffsetDateTime updatedAt = (OffsetDateTime) args[7];
            String dedupeKey = notificationId + ":" + provider;

            if (deliveryIdsByNotificationProvider.containsKey(dedupeKey)) {
                return 0;
            }

            Profile recipientProfile = new Profile();
            recipientProfile.setId(recipientProfileId);
            Notification notification = Notification.builder()
                    .id(notificationId)
                    .recipientProfile(recipientProfile)
                    .type("portfolio_liked")
                    .createdAt(createdAt)
                    .build();

            NotificationEmailDelivery delivery = NotificationEmailDelivery.builder()
                    .id(deliveryId)
                    .notification(notification)
                    .recipientProfile(recipientProfile)
                    .provider(provider)
                    .status(status)
                    .attemptCount(0)
                    .nextAttemptAt(nextAttemptAt)
                    .createdAt(createdAt)
                    .updatedAt(updatedAt)
                    .build();

            deliveriesById.put(deliveryId, delivery);
            deliveryIdsByNotificationProvider.put(dedupeKey, deliveryId);
            return 1;
        }

        private List<NotificationEmailDelivery> findDueDeliveries(Object[] args) {
            lastDueStatus = (String) args[0];
            OffsetDateTime now = (OffsetDateTime) args[1];
            lastDuePageable = (Pageable) args[2];

            return deliveriesById.values().stream()
                    .filter(delivery -> lastDueStatus.equals(delivery.getStatus()))
                    .filter(delivery -> !delivery.getNextAttemptAt().isAfter(now))
                    .sorted(Comparator.comparing(NotificationEmailDelivery::getCreatedAt))
                    .limit(lastDuePageable.getPageSize())
                    .toList();
        }
    }
}
