package com.webgen.webgen_backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${spring.rabbitmq.uri:NOT_SET}")
    private String rabbitUri;

    @PostConstruct
    public void logRabbitUri() {
        System.out.println("RABBIT URI = " + rabbitUri);
    }

    // Exchange (interfaces with work queue)
    public static final String EXCHANGE = "portfolio.exchange";
    // Work QUEUE
    public static final String QUEUE = "portfolio.generate.queue";
    // Label on where to send messages
    public static final String ROUTING_KEY = "portfolio.generate";

    // Exchange for section queue
    public static final String SECTION_QUEUE = "portfolio.section.queue";
    public static final String SECTION_ROUTING_KEY = "portfolio.section";

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
