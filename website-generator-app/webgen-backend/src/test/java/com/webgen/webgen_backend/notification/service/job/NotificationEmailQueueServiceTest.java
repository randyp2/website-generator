package com.webgen.webgen_backend.notification.service.job;

import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationEmailQueueServiceTest {

    @Test
    void queueDeliveryPublishesDeliveryMessage() {
        RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
        NotificationEmailQueueService service = new NotificationEmailQueueService(rabbitTemplate);
        UUID deliveryId = UUID.randomUUID();

        service.queueDelivery(deliveryId);

        assertThat(rabbitTemplate.calls).isEqualTo(1);
        assertThat(rabbitTemplate.exchange).isEqualTo(RabbitMQConfig.EXCHANGE);
        assertThat(rabbitTemplate.routingKey).isEqualTo(RabbitMQConfig.NOTIFICATION_EMAIL_ROUTING_KEY);
        assertThat(rabbitTemplate.message)
                .isInstanceOfSatisfying(NotificationEmailDeliveryMessage.class, message ->
                        assertThat(message.getDeliveryId()).isEqualTo(deliveryId));
    }

    @Test
    void queueDeliveryRejectsMissingDeliveryId() {
        RecordingRabbitTemplate rabbitTemplate = new RecordingRabbitTemplate();
        NotificationEmailQueueService service = new NotificationEmailQueueService(rabbitTemplate);

        assertThatThrownBy(() -> service.queueDelivery(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Delivery id is required");

        assertThat(rabbitTemplate.calls).isZero();
    }

    private static class RecordingRabbitTemplate extends RabbitTemplate {
        private int calls;
        private String exchange;
        private String routingKey;
        private Object message;

        @Override
        public void convertAndSend(String exchange, String routingKey, Object message) {
            this.calls++;
            this.exchange = exchange;
            this.routingKey = routingKey;
            this.message = message;
        }
    }
}
