package com.webgen.webgen_backend.verification.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationJobStatusDTO;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.service.ai.AIVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AssetVerificationWorker {

    private final AssetVerificationJobService jobService;
    private final AIVerificationService aiVerificationService;

    @RabbitListener(queues = RabbitMQConfig.ASSET_VERIFICATION_QUEUE, ackMode = "MANUAL")
    public void handleVerification(
            AssetVerificationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {

        String jobId = msg.getJobId();

        try {
            jobService.updateStatus(jobId, AssetVerificationJobStatusDTO.Status.PROCESSING);

            AssetVerificationResultDTO result = aiVerificationService.verify(msg);

            jobService.updateStatus(jobId, AssetVerificationJobStatusDTO.Status.COMPLETED);

            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.err.println(">>> [ASSET-VERIFY] failed | jobId=" + jobId + " | " +
                    e.getMessage());

            if (jobId != null)
                jobService.failJob(jobId, e.getMessage());

            channel.basicNack(deliveryTag, false, false);
        }
    }
}
