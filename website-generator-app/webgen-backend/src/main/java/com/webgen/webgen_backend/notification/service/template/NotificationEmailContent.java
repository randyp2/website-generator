package com.webgen.webgen_backend.notification.service.template;

/**
 * Fully rendered notification email content passed to the delivery provider.
 *
 * @param subject email subject line
 * @param htmlBody branded HTML representation
 * @param textBody plain-text fallback
 */
public record NotificationEmailContent(
        String subject,
        String htmlBody,
        String textBody
) {
}
