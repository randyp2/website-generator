package com.webgen.webgen_backend.notification.service.job;

import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEmailQueueService {

    private final RabbitTemplate rabbitTemplate;

    public void queueDelivery(UUID deliveryId) {
        Assert.notNull(deliveryId, "Delivery id is required");

        NotificationEmailDeliveryMessage message = NotificationEmailDeliveryMessage.builder()
                .deliveryId(deliveryId)
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.NOTIFICATION_EMAIL_ROUTING_KEY,
                message
        );

        log.info(
                "notification.email.queue.published deliveryId={} exchange={} routingKey={}",
                deliveryId,
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.NOTIFICATION_EMAIL_ROUTING_KEY);
    }
}
