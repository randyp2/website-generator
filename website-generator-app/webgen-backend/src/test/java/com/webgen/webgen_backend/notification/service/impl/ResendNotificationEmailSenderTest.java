package com.webgen.webgen_backend.notification.service.impl;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.webgen.webgen_backend.notification.config.ResendProperties;
import com.webgen.webgen_backend.notification.service.NotificationEmailSendException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResendNotificationEmailSenderTest {

    @Test
    void sendEmailBuildsResendRequestAndReturnsProviderMessageId() {
        RecordingResendEmailClient client = new RecordingResendEmailClient(new CreateEmailResponse("email_123"));
        ResendNotificationEmailSender sender = new ResendNotificationEmailSender(
                properties(" re_test_key ", " PortfolioGen <notifications@example.com> "),
                client);

        String providerMessageId = sender.sendEmail(
                " recipient@example.com ",
                " New notification ",
                " <p>Hello</p> ",
                " Hello ");

        assertThat(providerMessageId).isEqualTo("email_123");
        assertThat(client.apiKey).isEqualTo("re_test_key");
        assertThat(client.options.getFrom()).isEqualTo("PortfolioGen <notifications@example.com>");
        assertThat(client.options.getTo()).containsExactly("recipient@example.com");
        assertThat(client.options.getSubject()).isEqualTo("New notification");
        assertThat(client.options.getHtml()).isEqualTo("<p>Hello</p>");
        assertThat(client.options.getText()).isEqualTo("Hello");
    }

    @Test
    void sendEmailOmitsBlankTextBody() {
        RecordingResendEmailClient client = new RecordingResendEmailClient(new CreateEmailResponse("email_123"));
        ResendNotificationEmailSender sender = new ResendNotificationEmailSender(
                properties("re_test_key", "PortfolioGen <notifications@example.com>"),
                client);

        sender.sendEmail(
                "recipient@example.com",
                "New notification",
                "<p>Hello</p>",
                " ");

        assertThat(client.options.getText()).isNull();
    }

    @Test
    void sendEmailRejectsMissingRequiredFieldsBeforeCallingProvider() {
        RecordingResendEmailClient client = new RecordingResendEmailClient(new CreateEmailResponse("email_123"));
        ResendNotificationEmailSender sender = new ResendNotificationEmailSender(
                properties("", "PortfolioGen <notifications@example.com>"),
                client);

        assertThatThrownBy(() -> sender.sendEmail(
                "recipient@example.com",
                "New notification",
                "<p>Hello</p>",
                null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Resend API key is not configured");

        assertThat(client.calls).isZero();
    }

    @Test
    void sendEmailWrapsResendFailures() {
        RecordingResendEmailClient client = new RecordingResendEmailClient(
                new ResendException("Provider rejected request"));
        ResendNotificationEmailSender sender = new ResendNotificationEmailSender(
                properties("re_test_key", "PortfolioGen <notifications@example.com>"),
                client);

        assertThatThrownBy(() -> sender.sendEmail(
                "recipient@example.com",
                "New notification",
                "<p>Hello</p>",
                null))
                .isInstanceOf(NotificationEmailSendException.class)
                .hasMessage("Failed to send notification email")
                .hasCauseInstanceOf(ResendException.class);
    }

    private ResendProperties properties(String apiKey, String from) {
        ResendProperties properties = new ResendProperties();
        properties.setApiKey(apiKey);
        properties.setFrom(from);
        return properties;
    }

    private static class RecordingResendEmailClient extends ResendEmailClient {
        private final CreateEmailResponse response;
        private final ResendException exception;
        private int calls;
        private String apiKey;
        private CreateEmailOptions options;

        private RecordingResendEmailClient(CreateEmailResponse response) {
            this.response = response;
            this.exception = null;
        }

        private RecordingResendEmailClient(ResendException exception) {
            this.response = null;
            this.exception = exception;
        }

        @Override
        public CreateEmailResponse send(String apiKey, CreateEmailOptions options) throws ResendException {
            calls++;
            this.apiKey = apiKey;
            this.options = options;
            if (exception != null) {
                throw exception;
            }
            return response;
        }
    }
}
