package com.webgen.webgen_backend.notification.service.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.notification.service.impl.NotificationEmailDeliveryService;
import com.webgen.webgen_backend.notification.service.impl.ResendNotificationEmailSender;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEmailWorker {

    private static final String PRODUCT_NAME = "PortfolioGen";

    private final NotificationEmailDeliveryService notificationEmailDeliveryService;
    private final ResendNotificationEmailSender resendNotificationEmailSender;

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

        NotificationEmailContent content = buildContent(delivery);
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
            log.warn(
                    "notification.email.worker.send_failed deliveryId={} reason={}",
                    deliveryId,
                    exception.getMessage());
            markFailedAndAck(deliveryId, exception, channel, deliveryTag);
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
            Exception exception,
            Channel channel,
            long deliveryTag) throws IOException {
        try {
            notificationEmailDeliveryService.markFailed(deliveryId, exception.getMessage());
            channel.basicAck(deliveryTag, false);
            log.warn(
                    "notification.email.worker.failed deliveryId={} reason={} deliveryTag={}",
                    deliveryId,
                    exception.getMessage(),
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

    private String recipientEmail(NotificationEmailDelivery delivery) {
        Profile recipient = delivery.getRecipientProfile();
        return recipient == null ? null : recipient.getEmail();
    }

    private NotificationEmailContent buildContent(NotificationEmailDelivery delivery) {
        Notification notification = delivery.getNotification();
        String recipientName = displayName(delivery.getRecipientProfile(), "there");
        String actorName = displayName(notification == null ? null : notification.getActorProfile(), "Someone");
        String portfolioTitle = portfolioTitle(notification);
        String commentPreview = commentPreview(notification);

        String subject = subject(notification == null ? null : notification.getType(), actorName);
        String summary = summary(notification == null ? null : notification.getType(), actorName, portfolioTitle);
        String textBody = textBody(recipientName, summary, commentPreview);
        String htmlBody = htmlBody(recipientName, summary, commentPreview);

        return new NotificationEmailContent(subject, htmlBody, textBody);
    }

    private String subject(String type, String actorName) {
        return switch (type == null ? "" : type) {
            case NotificationService.TYPE_PORTFOLIO_LIKED -> actorName + " liked your portfolio";
            case NotificationService.TYPE_PORTFOLIO_COMMENTED -> actorName + " commented on your portfolio";
            case NotificationService.TYPE_COMMENT_REPLIED -> actorName + " replied to your comment";
            case NotificationService.TYPE_COMMENT_LIKED -> actorName + " liked your comment";
            case NotificationService.TYPE_PROFILE_FOLLOWED -> actorName + " followed you";
            default -> "You have a new notification";
        };
    }

    private String summary(String type, String actorName, String portfolioTitle) {
        return switch (type == null ? "" : type) {
            case NotificationService.TYPE_PORTFOLIO_LIKED ->
                    actorName + " liked " + portfolioTitle + ".";
            case NotificationService.TYPE_PORTFOLIO_COMMENTED ->
                    actorName + " commented on " + portfolioTitle + ".";
            case NotificationService.TYPE_COMMENT_REPLIED ->
                    actorName + " replied to your comment on " + portfolioTitle + ".";
            case NotificationService.TYPE_COMMENT_LIKED ->
                    actorName + " liked your comment on " + portfolioTitle + ".";
            case NotificationService.TYPE_PROFILE_FOLLOWED ->
                    actorName + " started following you.";
            default -> "You have a new notification.";
        };
    }

    private String textBody(String recipientName, String summary, String commentPreview) {
        StringBuilder body = new StringBuilder()
                .append("Hi ")
                .append(recipientName)
                .append(",\n\n")
                .append(summary);

        if (StringUtils.hasText(commentPreview)) {
            body.append("\n\n\"")
                    .append(commentPreview.trim())
                    .append("\"");
        }

        body.append("\n\nOpen ")
                .append(PRODUCT_NAME)
                .append(" to view the notification.");

        return body.toString();
    }

    private String htmlBody(String recipientName, String summary, String commentPreview) {
        StringBuilder body = new StringBuilder()
                .append("<p>Hi ")
                .append(escape(recipientName))
                .append(",</p>")
                .append("<p>")
                .append(escape(summary))
                .append("</p>");

        if (StringUtils.hasText(commentPreview)) {
            body.append("<blockquote>")
                    .append(escape(commentPreview.trim()))
                    .append("</blockquote>");
        }

        body.append("<p>Open ")
                .append(PRODUCT_NAME)
                .append(" to view the notification.</p>");

        return body.toString();
    }

    private String displayName(Profile profile, String fallback) {
        if (profile == null) {
            return fallback;
        }
        if (StringUtils.hasText(profile.getFullName())) {
            return profile.getFullName().trim();
        }
        if (StringUtils.hasText(profile.getUsername())) {
            return profile.getUsername().trim();
        }
        return fallback;
    }

    private String portfolioTitle(Notification notification) {
        if (notification == null) {
            return "your portfolio";
        }

        Portfolio portfolio = notification.getPortfolio();
        if (portfolio != null && StringUtils.hasText(portfolio.getTitle())) {
            return "\"" + portfolio.getTitle().trim() + "\"";
        }
        return "your portfolio";
    }

    private String commentPreview(Notification notification) {
        if (notification == null || notification.getMetadata() == null) {
            return null;
        }

        JsonNode preview = notification.getMetadata().path("commentPreview");
        if (!preview.isTextual() || !StringUtils.hasText(preview.asText())) {
            return null;
        }
        return preview.asText().trim();
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }

    private record NotificationEmailContent(String subject, String htmlBody, String textBody) {
    }
}
