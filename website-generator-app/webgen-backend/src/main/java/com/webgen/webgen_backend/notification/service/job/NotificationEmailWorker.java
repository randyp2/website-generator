package com.webgen.webgen_backend.notification.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.service.impl.NotificationEmailDeliveryService;
import com.webgen.webgen_backend.notification.service.impl.ResendNotificationEmailSender;
import com.webgen.webgen_backend.notification.service.template.NotificationEmailContent;
import com.webgen.webgen_backend.notification.service.template.NotificationEmailContentFactory;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEmailWorker {

    private final NotificationEmailDeliveryService notificationEmailDeliveryService;
    private final ResendNotificationEmailSender resendNotificationEmailSender;
    private final NotificationEmailContentFactory notificationEmailContentFactory;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_EMAIL_QUEUE, ackMode = "MANUAL")
    public void handleNotificationEmail(
            NotificationEmailDeliveryMessage message,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        UUID deliveryId = message == null ? null : message.getDeliveryId();
        if (deliveryId == null) {
            log.warn("notification.email.worker.invalid_message deliveryTag={}", deliveryTag);
            channel.basicNack(deliveryTag, false, false);
            return;
        }

        log.info("notification.email.worker.received deliveryId={} deliveryTag={}", deliveryId, deliveryTag);
        Optional<NotificationEmailDelivery> claimedDelivery;
        try {
            claimedDelivery = notificationEmailDeliveryService.markProcessing(deliveryId);
        } catch (Exception exception) {
            log.warn(
                    "notification.email.worker.claim_failed deliveryId={} deliveryTag={}",
                    deliveryId,
                    deliveryTag,
                    exception);
            channel.basicNack(deliveryTag, false, false);
            return;
        }

        if (claimedDelivery.isEmpty()) {
            log.info("notification.email.worker.no_claim deliveryId={} deliveryTag={}", deliveryId, deliveryTag);
            channel.basicAck(deliveryTag, false);
            return;
        }

        processClaimedDelivery(claimedDelivery.get(), channel, deliveryTag);
    }

    private void processClaimedDelivery(
            NotificationEmailDelivery delivery,
            Channel channel,
            long deliveryTag) throws IOException {
        UUID deliveryId = delivery.getId();
        Notification notification = delivery.getNotification();
        UUID notificationId = notification == null ? null : notification.getId();
        UUID recipientProfileId = delivery.getRecipientProfile() == null
                ? null
                : delivery.getRecipientProfile().getId();

        log.info(
                "notification.email.worker.claimed deliveryId={} notificationId={} recipientProfileId={} deliveryTag={}",
                deliveryId,
                notificationId,
                recipientProfileId,
                deliveryTag);

        String recipientEmail = recipientEmail(delivery);
        if (!StringUtils.hasText(recipientEmail)) {
            log.info("notification.email.worker.skip_missing_email deliveryId={}", deliveryId);
            markSkippedAndAck(deliveryId, "Recipient email is missing", channel, deliveryTag);
            return;
        }

        NotificationEmailContent content = notificationEmailContentFactory.build(delivery);
        String providerMessageId;
        try {
            log.info(
                    "notification.email.worker.sending deliveryId={} notificationId={} type={}",
                    deliveryId,
                    notificationId,
                    notification == null ? null : notification.getType());
            providerMessageId = resendNotificationEmailSender.sendEmail(
                    recipientEmail,
                    content.subject(),
                    content.htmlBody(),
                    content.textBody()
            );
        } catch (Exception exception) {
            String failureReason = failureReason(exception);
            log.warn(
                    "notification.email.worker.send_failed deliveryId={} reason={}",
                    deliveryId,
                    failureReason);
            markFailedAndAck(deliveryId, failureReason, channel, deliveryTag);
            return;
        }

        try {
            notificationEmailDeliveryService.markSent(deliveryId, providerMessageId);
            channel.basicAck(deliveryTag, false);
            log.info(
                    "notification.email.worker.sent deliveryId={} providerMessageId={} deliveryTag={}",
                    deliveryId,
                    providerMessageId,
                    deliveryTag);
        } catch (Exception exception) {
            log.warn(
                    "notification.email.worker.mark_sent_failed deliveryId={} providerMessageId={} deliveryTag={}",
                    deliveryId,
                    providerMessageId,
                    deliveryTag,
                    exception);
            channel.basicNack(deliveryTag, false, false);
        }
    }

    private void markSkippedAndAck(
            UUID deliveryId,
            String reason,
            Channel channel,
            long deliveryTag) throws IOException {
        try {
            notificationEmailDeliveryService.markSkipped(deliveryId, reason);
            channel.basicAck(deliveryTag, false);
            log.info(
                    "notification.email.worker.skipped deliveryId={} reason={} deliveryTag={}",
                    deliveryId,
                    reason,
                    deliveryTag);
        } catch (Exception exception) {
            log.warn(
                    "notification.email.worker.mark_skipped_failed deliveryId={} reason={} deliveryTag={}",
                    deliveryId,
                    reason,
                    deliveryTag,
                    exception);
            channel.basicNack(deliveryTag, false, false);
        }
    }

    private void markFailedAndAck(
            UUID deliveryId,
            String reason,
            Channel channel,
            long deliveryTag) throws IOException {
        try {
            notificationEmailDeliveryService.markFailed(deliveryId, reason);
            channel.basicAck(deliveryTag, false);
            log.warn(
                    "notification.email.worker.failed deliveryId={} reason={} deliveryTag={}",
                    deliveryId,
                    reason,
                    deliveryTag);
        } catch (Exception statusException) {
            log.warn(
                    "notification.email.worker.mark_failed_failed deliveryId={} deliveryTag={}",
                    deliveryId,
                    deliveryTag,
                    statusException);
            channel.basicNack(deliveryTag, false, false);
        }
    }

    private String failureReason(Exception exception) {
        Throwable rootCause = exception;
        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        String rootCauseMessage = rootCause.getMessage();
        if (StringUtils.hasText(rootCauseMessage)) {
            return rootCauseMessage.trim();
        }

        String exceptionMessage = exception.getMessage();
        if (StringUtils.hasText(exceptionMessage)) {
            return exceptionMessage.trim();
        }

        return exception.getClass().getSimpleName();
    }

    private String recipientEmail(NotificationEmailDelivery delivery) {
        Profile recipient = delivery.getRecipientProfile();
        return recipient == null ? null : recipient.getEmail();
    }

}
