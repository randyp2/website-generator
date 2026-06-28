package com.webgen.webgen_backend.notification.service.impl;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.webgen.webgen_backend.notification.config.ResendProperties;
import com.webgen.webgen_backend.notification.service.NotificationEmailSendException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ResendNotificationEmailSender {

    private final ResendProperties resendProperties;
    private final ResendEmailClient resendEmailClient;

    public String sendEmail(String recipientEmail, String subject, String htmlBody, String textBody) {
        String normalizedRecipient = requireText(recipientEmail, "Recipient email is required");
        String normalizedSubject = requireText(subject, "Email subject is required");
        String normalizedHtmlBody = requireText(htmlBody, "Email HTML body is required");
        String normalizedApiKey = requireText(resendProperties.getApiKey(), "Resend API key is not configured");
        String normalizedFromAddress = requireText(resendProperties.getFrom(), "Resend from address is not configured");

        CreateEmailOptions.Builder emailBuilder = CreateEmailOptions.builder()
                .from(normalizedFromAddress)
                .to(normalizedRecipient)
                .subject(normalizedSubject)
                .html(normalizedHtmlBody);

        if (StringUtils.hasText(textBody)) {
            emailBuilder.text(textBody.trim());
        }

        try {
            CreateEmailResponse response = resendEmailClient.send(normalizedApiKey, emailBuilder.build());
            return requireText(response.getId(), "Resend returned an empty message id");
        } catch (ResendException exception) {
            throw new NotificationEmailSendException("Failed to send notification email", exception);
        }
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(message);
        }
        return value.trim();
    }

}
