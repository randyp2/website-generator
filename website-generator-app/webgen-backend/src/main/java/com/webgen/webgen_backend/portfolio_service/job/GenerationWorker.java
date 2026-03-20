package com.webgen.webgen_backend.portfolio_service.job;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.JobStatusDTO;
import com.webgen.webgen_backend.dto.portfolio.PortfolioGenerateRequestDTO;
import com.webgen.webgen_backend.portfolio_service.PortfolioAiService;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class GenerationWorker {

    private final GenerateJobService jobService;
    private final PortfolioAiService portfolioAiService;


    // Worker that is subscribed to the portfolio.generate.queue
    // Establish persistent tcp connection to determine if messages have arrived
    @RabbitListener(queues = RabbitMQConfig.QUEUE, ackMode = "MANUAL")
    public void handleGeneration(
            PortfolioGenerationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {

        String jobId = msg.getJobId();

        try {

            UUID portfolioId = UUID.fromString(msg.getPortfolioId());
            UUID userId = UUID.fromString(msg.getUserId());

            jobService.updateStatus(jobId, JobStatusDTO.Status.PROCESSING);
            portfolioAiService.generatePortfolio(portfolioId, userId, msg.getReq(), jobId);


            // Send ack and take off queue
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {

            System.err.println(">>> [WORKER] Job failed: " + e.getMessage());

            if (jobId != null)
                jobService.failJob(jobId, e.getMessage());

            // Reject message and send to dead letter queue
            channel.basicNack(deliveryTag, false, false);
        }
    }

    // Worker subscribed to section generation queue
    // Create 4-8 rabbitmq consumers for parallel generation
    @RabbitListener(queues = RabbitMQConfig.SECTION_QUEUE, concurrency = "4-8", ackMode = "MANUAL")
    public void handleSection(
            SectionGenerationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        String jobId = msg.getJobId();

        try {
            portfolioAiService.generateSingleSectionFromQueue(msg);

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.err.println(">>> [SECTION-WORKER] Section failed: "
                    + msg.getPlanItem().getSectionKey() + " | " + e.getMessage());

            if (jobId != null)
                jobService.failJob(jobId, e.getMessage());

            channel.basicNack(deliveryTag, false, false);
        }
    }

    // Worker subscribed the dlq
    @RabbitListener(queues = RabbitMQConfig.DLQ, ackMode = "MANUAL")
    public void handleDeadLetter(
            PortfolioGenerationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        System.err.println(">>> [DLQ] Failed job: " + msg.getJobId()
                + " | portfolio: " + msg.getPortfolioId());

        channel.basicAck(deliveryTag, false);
    }


}
