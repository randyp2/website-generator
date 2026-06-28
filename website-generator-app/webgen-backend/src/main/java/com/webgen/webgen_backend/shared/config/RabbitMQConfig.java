package com.webgen.webgen_backend.shared.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange (interfaces with work queue)
    public static final String EXCHANGE = "portfolio.exchange";
    // Work QUEUE
    public static final String QUEUE = "portfolio.generate.queue";
    // Label on where to send messages
    public static final String ROUTING_KEY = "portfolio.generate";

    // Exchange for section queue
    public static final String SECTION_QUEUE = "portfolio.section.queue";
    public static final String SECTION_ROUTING_KEY = "portfolio.section";

    // Screenshot queue
    public static final String SCREENSHOT_QUEUE = "portfolio.screenshot.queue";
    public static final String SCREENSHOT_ROUTING_KEY = "portfolio.screenshot";
    public static final String SCREENSHOT_DLQ = "portfolio.screenshot.dlq";
    public static final String SCREENSHOT_DLQ_ROUTING_KEY = "portfolio.screenshot.dead";

    // Asset verification queue
    public static final String ASSET_VERIFICATION_QUEUE = "verification.asset.queue";
    public static final String ASSET_VERIFICATION_ROUTING_KEY = "verification.asset";
    public static final String ASSET_VERIFICATION_DLQ = "verification.asset.dlq";
    public static final String ASSET_VERIFICATION_DLQ_ROUTING_KEY = "verification.asset.dead";

    // Notification email delivery queue
    public static final String NOTIFICATION_EMAIL_QUEUE = "notification.email.queue";
    public static final String NOTIFICATION_EMAIL_ROUTING_KEY = "notification.email";
    public static final String NOTIFICATION_EMAIL_DLQ = "notification.email.dlq";
    public static final String NOTIFICATION_EMAIL_DLQ_ROUTING_KEY = "notification.email.dead";

    // Exchange for DLQ
    public static final String DLX = "portfolio.dlx";
    // Dead letter queue for retries/inspections
    public static final String DLQ = "portfolio.generate.dlq";
    public static final String DLQ_ROUTING_KEY = "portfolio.generate.dead";

    /* ======== MAIN PORTFOLIO GENERATION QUEUE ======== */
    @Bean
    public Queue generateQueue() {
        // - Generate persistent/durable queue
        // - Send to dead letter queue if message fails
        // - Send to DLQ w/ specified routing key
        return QueueBuilder.durable(QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    // Connect queue to portfolio.exchange w/ specified routing key
    // Send messages w/ routing key to portfolio.exchange
    @Bean
    public Binding binding(Queue generateQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generateQueue).to(exchange).with(ROUTING_KEY);
    }

    /* ======== PER SECTION GENERATION QUEUE ======== */
    @Bean
    public Queue sectionQueue() {
        return QueueBuilder.durable(SECTION_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding sectionBinding(Queue sectionQueue, DirectExchange exchange) {
        return BindingBuilder.bind(sectionQueue).to(exchange).with(SECTION_ROUTING_KEY);
    }

    /* ======== SCREENSHOT QUEUE ======== */
    @Bean
    public Queue screenshotQueue() {
        return QueueBuilder.durable(SCREENSHOT_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", SCREENSHOT_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding screenshotBinding(Queue screenshotQueue, DirectExchange exchange) {
        return BindingBuilder.bind(screenshotQueue).to(exchange).with(SCREENSHOT_ROUTING_KEY);
    }

    @Bean
    public Queue screenshotDeadLetterQueue() {
        return QueueBuilder.durable(SCREENSHOT_DLQ)
                .withArgument("x-message-ttl", 86400000) // 24 hours
                .build();
    }

    @Bean
    public Binding screenshotDlqBinding(Queue screenshotDeadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(screenshotDeadLetterQueue).to(deadLetterExchange).with(SCREENSHOT_DLQ_ROUTING_KEY);
    }

    /* ======== ASSET VERIFICATION QUEUE ======== */
    @Bean
    public Queue assetVerificationQueue() {
        return QueueBuilder.durable(ASSET_VERIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", ASSET_VERIFICATION_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding assetVerificationBinding(Queue assetVerificationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(assetVerificationQueue).to(exchange).with(ASSET_VERIFICATION_ROUTING_KEY);
    }

    @Bean
    public Queue assetVerificationDeadLetterQueue() {
        return QueueBuilder.durable(ASSET_VERIFICATION_DLQ)
                .withArgument("x-message-ttl", 86400000) // 24 hours
                .build();
    }

    @Bean
    public Binding assetVerificationDlqBinding(
            Queue assetVerificationDeadLetterQueue,
            DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(assetVerificationDeadLetterQueue)
                .to(deadLetterExchange)
                .with(ASSET_VERIFICATION_DLQ_ROUTING_KEY);
    }

    /* ======== NOTIFICATION EMAIL QUEUE ======== */
    @Bean
    public Queue notificationEmailQueue() {
        return QueueBuilder.durable(NOTIFICATION_EMAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", NOTIFICATION_EMAIL_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding notificationEmailBinding(Queue notificationEmailQueue, DirectExchange exchange) {
        return BindingBuilder.bind(notificationEmailQueue).to(exchange).with(NOTIFICATION_EMAIL_ROUTING_KEY);
    }

    @Bean
    public Queue notificationEmailDeadLetterQueue() {
        return QueueBuilder.durable(NOTIFICATION_EMAIL_DLQ)
                .withArgument("x-message-ttl", 86400000) // 24 hours
                .build();
    }

    @Bean
    public Binding notificationEmailDlqBinding(
            Queue notificationEmailDeadLetterQueue,
            DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(notificationEmailDeadLetterQueue)
                .to(deadLetterExchange)
                .with(NOTIFICATION_EMAIL_DLQ_ROUTING_KEY);
    }

    /* ======== DEAD LETTER QUEUE ======== */
    // Configure dead letter queue
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ)
                .withArgument("x-message-ttl", 86400000) // 24 hours
                .build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX);
    }

    @Bean
    public Binding dlqBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(DLQ_ROUTING_KEY);
    }

    // Serialize messages to JSON
    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
