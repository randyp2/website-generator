package com.webgen.webgen_backend.portfolio.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.portfolio.service.builder.BuilderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import com.webgen.webgen_backend.portfolio.dto.JobStatusDTO;
import com.webgen.webgen_backend.portfolio.service.PortfolioAiService;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class GenerationWorker {

    private final GenerateJobService jobService;
    private final PortfolioAiService portfolioAiService;
    private final BuilderService builderService;
    private final CreditGuardService creditGuardService;


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
            portfolioAiService.generatePortfolio(
                    portfolioId,
                    userId,
                    msg.getReq(),
                    jobId,
                    msg.getCreditReservationId()
            );
        } catch (Exception e) {

            log.error("Portfolio generation job failed jobId={} reason={}", jobId, e.getMessage(), e);
            recordFailedOperation(jobId, msg.getCreditReservationId(), e);
            channel.basicNack(deliveryTag, false, false);
            return;
        }

        // Acknowledge outside the processing catch so transport failures do not refund completed work.
        channel.basicAck(deliveryTag, false);
    }

    // Worker subscribed to section generation queue
    // Runs 10 concurrent rabbitmq consumers for parallel generation
    @RabbitListener(queues = RabbitMQConfig.SECTION_QUEUE, concurrency = "10", ackMode = "MANUAL")
    public void handleSection(
            SectionGenerationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        String jobId = msg.getJobId();

        try {
            // Route msg to service based on mode
            if (msg.getMode() == SectionGenerationMessage.Mode.GENERATE)
                portfolioAiService.generateSingleSectionFromQueue(msg);
            else
                builderService.refineSingleSectionFromQueue(msg);
        } catch (Exception e) {

            // Get section key based on mode
            String sectionKey = sectionKey(msg);

            log.error("Section generation failed jobId={} sectionKey={} reason={}", jobId, sectionKey, e.getMessage(), e);

            recordFailedOperation(jobId, msg.getCreditReservationId(), e);
            channel.basicNack(deliveryTag, false, false);
            return;
        }

        channel.basicAck(deliveryTag, false);
    }

    // Worker subscribed the dlq
    @RabbitListener(queues = RabbitMQConfig.DLQ, ackMode = "MANUAL")
    public void handleDeadLetter(
            PortfolioGenerationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        log.error("Dead-lettered portfolio generation job jobId={} portfolioId={}",
                msg.getJobId(), msg.getPortfolioId());

        channel.basicAck(deliveryTag, false);
    }

    private void recordFailedOperation(
            String jobId,
            UUID creditReservationId,
            Exception failure
    ) {
        if (jobId != null) {
            try {
                jobService.failJob(jobId, jobFailureDescription(failure));
            } catch (RuntimeException statusFailure) {
                failure.addSuppressed(statusFailure);
                log.error("Failed to update failed job status for {}", jobId, statusFailure);
            }
        }

        if (creditReservationId != null) {
            try {
                creditGuardService.refundCredits(
                        creditReservationId,
                        failure.getClass().getSimpleName()
                );
            } catch (RuntimeException refundFailure) {
                failure.addSuppressed(refundFailure);
                log.error("Failed to refund credit reservation {}", creditReservationId, refundFailure);
            }
        }
    }

    private String sectionKey(SectionGenerationMessage msg) {
        if (msg.getMode() == SectionGenerationMessage.Mode.GENERATE && msg.getPlanItem() != null) {
            return msg.getPlanItem().getSectionKey();
        }
        if (msg.getRefinePlan() != null) {
            return msg.getRefinePlan().getSectionKey();
        }
        return "unknown";
    }

    private String jobFailureDescription(Exception failure) {
        String message = failure.getMessage();
        return message == null || message.isBlank() ? failure.getClass().getSimpleName() : message;
    }

}
