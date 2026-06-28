package com.webgen.webgen_backend.notification.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.notification.config.ResendProperties;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.notification.service.impl.NotificationEmailDeliveryService;
import com.webgen.webgen_backend.notification.service.impl.ResendEmailClient;
import com.webgen.webgen_backend.notification.service.impl.ResendNotificationEmailSender;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationEmailWorkerTest {

    private static final long DELIVERY_TAG = 42L;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void handleNotificationEmailSendsEmailAndMarksDeliverySent() throws Exception {
        UUID deliveryId = UUID.randomUUID();
        RecordingDeliveryService deliveryService = new RecordingDeliveryService();
        deliveryService.claimedDelivery = Optional.of(delivery(deliveryId, "recipient@example.com"));
        RecordingEmailSender emailSender = new RecordingEmailSender();
        RecordingChannel channel = new RecordingChannel();
        NotificationEmailWorker worker = new NotificationEmailWorker(deliveryService, emailSender);

        worker.handleNotificationEmail(message(deliveryId), channel.proxy(), DELIVERY_TAG);

        assertThat(deliveryService.markProcessingId).isEqualTo(deliveryId);
        assertThat(emailSender.recipientEmail).isEqualTo("recipient@example.com");
        assertThat(emailSender.subject).isEqualTo("Actor Name commented on your portfolio");
        assertThat(emailSender.htmlBody).contains("Nice work");
        assertThat(emailSender.textBody).contains("Nice work");
        assertThat(deliveryService.markSentId).isEqualTo(deliveryId);
        assertThat(deliveryService.providerMessageId).isEqualTo("email_123");
        assertThat(channel.ackCount).isEqualTo(1);
        assertThat(channel.nackCount).isZero();
    }

    @Test
    void handleNotificationEmailSkipsDeliveryWhenRecipientEmailIsMissing() throws Exception {
        UUID deliveryId = UUID.randomUUID();
        RecordingDeliveryService deliveryService = new RecordingDeliveryService();
        deliveryService.claimedDelivery = Optional.of(delivery(deliveryId, " "));
        RecordingEmailSender emailSender = new RecordingEmailSender();
        RecordingChannel channel = new RecordingChannel();
        NotificationEmailWorker worker = new NotificationEmailWorker(deliveryService, emailSender);

        worker.handleNotificationEmail(message(deliveryId), channel.proxy(), DELIVERY_TAG);

        assertThat(emailSender.calls).isZero();
        assertThat(deliveryService.markSkippedId).isEqualTo(deliveryId);
        assertThat(deliveryService.skipReason).isEqualTo("Recipient email is missing");
        assertThat(channel.ackCount).isEqualTo(1);
        assertThat(channel.nackCount).isZero();
    }

    @Test
    void handleNotificationEmailMarksFailedWhenProviderSendFails() throws Exception {
        UUID deliveryId = UUID.randomUUID();
        RecordingDeliveryService deliveryService = new RecordingDeliveryService();
        deliveryService.claimedDelivery = Optional.of(delivery(deliveryId, "recipient@example.com"));
        RecordingEmailSender emailSender = new RecordingEmailSender();
        emailSender.failure = new IllegalStateException("Provider unavailable");
        RecordingChannel channel = new RecordingChannel();
        NotificationEmailWorker worker = new NotificationEmailWorker(deliveryService, emailSender);

        worker.handleNotificationEmail(message(deliveryId), channel.proxy(), DELIVERY_TAG);

        assertThat(deliveryService.markFailedId).isEqualTo(deliveryId);
        assertThat(deliveryService.failureReason).isEqualTo("Provider unavailable");
        assertThat(deliveryService.markSentId).isNull();
        assertThat(channel.ackCount).isEqualTo(1);
        assertThat(channel.nackCount).isZero();
    }

    @Test
    void handleNotificationEmailAcksWhenDeliveryCannotBeClaimed() throws Exception {
        UUID deliveryId = UUID.randomUUID();
        RecordingDeliveryService deliveryService = new RecordingDeliveryService();
        deliveryService.claimedDelivery = Optional.empty();
        RecordingEmailSender emailSender = new RecordingEmailSender();
        RecordingChannel channel = new RecordingChannel();
        NotificationEmailWorker worker = new NotificationEmailWorker(deliveryService, emailSender);

        worker.handleNotificationEmail(message(deliveryId), channel.proxy(), DELIVERY_TAG);

        assertThat(emailSender.calls).isZero();
        assertThat(channel.ackCount).isEqualTo(1);
        assertThat(channel.nackCount).isZero();
    }

    @Test
    void handleNotificationEmailNacksInvalidMessage() throws Exception {
        RecordingDeliveryService deliveryService = new RecordingDeliveryService();
        RecordingEmailSender emailSender = new RecordingEmailSender();
        RecordingChannel channel = new RecordingChannel();
        NotificationEmailWorker worker = new NotificationEmailWorker(deliveryService, emailSender);

        worker.handleNotificationEmail(new NotificationEmailDeliveryMessage(), channel.proxy(), DELIVERY_TAG);

        assertThat(emailSender.calls).isZero();
        assertThat(channel.ackCount).isZero();
        assertThat(channel.nackCount).isEqualTo(1);
        assertThat(channel.requeue).isFalse();
    }

    private NotificationEmailDeliveryMessage message(UUID deliveryId) {
        return NotificationEmailDeliveryMessage.builder()
                .deliveryId(deliveryId)
                .build();
    }

    private NotificationEmailDelivery delivery(UUID deliveryId, String recipientEmail) {
        Profile recipient = new Profile();
        recipient.setId(UUID.randomUUID());
        recipient.setFullName("Recipient Name");
        recipient.setEmail(recipientEmail);

        Profile actor = new Profile();
        actor.setId(UUID.randomUUID());
        actor.setFullName("Actor Name");
        actor.setUsername("actor");

        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setTitle("Launch Portfolio");

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .recipientProfile(recipient)
                .actorProfile(actor)
                .type(NotificationService.TYPE_PORTFOLIO_COMMENTED)
                .portfolio(portfolio)
                .metadata(objectMapper.createObjectNode().put("commentPreview", "Nice work"))
                .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();

        return NotificationEmailDelivery.builder()
                .id(deliveryId)
                .notification(notification)
                .recipientProfile(recipient)
                .provider(NotificationEmailDeliveryService.PROVIDER_RESEND)
                .status(NotificationEmailDeliveryService.STATUS_PROCESSING)
                .attemptCount(1)
                .nextAttemptAt(OffsetDateTime.now(ZoneOffset.UTC))
                .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
                .updatedAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
    }

    private static class RecordingDeliveryService extends NotificationEmailDeliveryService {
        private Optional<NotificationEmailDelivery> claimedDelivery = Optional.empty();
        private UUID markProcessingId;
        private UUID markSentId;
        private String providerMessageId;
        private UUID markSkippedId;
        private String skipReason;
        private UUID markFailedId;
        private String failureReason;

        private RecordingDeliveryService() {
            super(null);
        }

        @Override
        public Optional<NotificationEmailDelivery> markProcessing(UUID deliveryId) {
            markProcessingId = deliveryId;
            return claimedDelivery;
        }

        @Override
        public Optional<NotificationEmailDelivery> markSent(UUID deliveryId, String providerMessageId) {
            this.markSentId = deliveryId;
            this.providerMessageId = providerMessageId;
            return claimedDelivery;
        }

        @Override
        public Optional<NotificationEmailDelivery> markSkipped(UUID deliveryId, String reason) {
            this.markSkippedId = deliveryId;
            this.skipReason = reason;
            return claimedDelivery;
        }

        @Override
        public Optional<NotificationEmailDelivery> markFailed(UUID deliveryId, String lastError) {
            this.markFailedId = deliveryId;
            this.failureReason = lastError;
            return claimedDelivery;
        }
    }

    private static class RecordingEmailSender extends ResendNotificationEmailSender {
        private int calls;
        private RuntimeException failure;
        private String recipientEmail;
        private String subject;
        private String htmlBody;
        private String textBody;

        private RecordingEmailSender() {
            super(new ResendProperties(), new ResendEmailClient());
        }

        @Override
        public String sendEmail(String recipientEmail, String subject, String htmlBody, String textBody) {
            calls++;
            this.recipientEmail = recipientEmail;
            this.subject = subject;
            this.htmlBody = htmlBody;
            this.textBody = textBody;
            if (failure != null) {
                throw failure;
            }
            return "email_123";
        }
    }

    private static class RecordingChannel {
        private int ackCount;
        private int nackCount;
        private boolean requeue;

        private Channel proxy() {
            return (Channel) Proxy.newProxyInstance(
                    Channel.class.getClassLoader(),
                    new Class[]{Channel.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return switch (method.getName()) {
                                case "toString" -> "channel";
                                case "hashCode" -> System.identityHashCode(proxy);
                                case "equals" -> proxy == args[0];
                                default -> null;
                            };
                        }

                        if ("basicAck".equals(method.getName())) {
                            ackCount++;
                            return null;
                        }

                        if ("basicNack".equals(method.getName())) {
                            nackCount++;
                            requeue = (boolean) args[2];
                            return null;
                        }

                        throw new UnsupportedOperationException(
                                "Unexpected channel method invocation: " + method.getName()
                        );
                    }
            );
        }
    }
}
