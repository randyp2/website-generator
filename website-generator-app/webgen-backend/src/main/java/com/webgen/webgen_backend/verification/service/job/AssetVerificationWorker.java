package com.webgen.webgen_backend.verification.service.job;

import com.rabbitmq.client.Channel;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationJobStatusDTO;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.service.ai.AIVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetVerificationWorker {

    private final AssetVerificationJobService jobService;
    private final AIVerificationService aiVerificationService;
    private final AccountDeletionStateService accountDeletionStateService;

    @RabbitListener(queues = RabbitMQConfig.ASSET_VERIFICATION_QUEUE, ackMode = "MANUAL")
    public void handleVerification(
            AssetVerificationMessage msg,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {

        String jobId = msg.getJobId();
        System.out.println(">>> [ASSET-WORKER] consume | jobId=" + jobId
                + " uploadId=" + msg.getUploadId()
                + " claimId=" + msg.getClaimId()
                + " deliveryTag=" + deliveryTag);

        try {
            if (isOwnedByDeletingAccount(msg)) {
                jobService.cancelForAccountDeletion(jobId);
                channel.basicAck(deliveryTag, false);
                return;
            }
            if (!jobService.beginAttempt(jobId)) {
                channel.basicAck(deliveryTag, false);
                return;
            }
            System.out.println(">>> [ASSET-WORKER] processing | jobId=" + jobId);

            AssetVerificationResultDTO result = aiVerificationService.verify(msg);
            log.info("Verification worker succeeded jobId={} matchConfidence={} evidenceDepth={}",
                    jobId,
                    result == null ? null : result.getMatchConfidence(),
                    result == null ? null : result.getEvidenceDepth());

            jobService.complete(jobId);
            System.out.println(">>> [ASSET-WORKER] completed | jobId=" + jobId);

            channel.basicAck(deliveryTag, false);
            System.out.println(">>> [ASSET-WORKER] ack | jobId=" + jobId + " deliveryTag=" + deliveryTag);
        } catch (Exception e) {
            System.err.println(">>> [ASSET-VERIFY] failed | jobId=" + jobId + " | " +
                    e.getMessage());

            boolean retry = jobId != null && jobService.failAttempt(jobId, e.getMessage());
            channel.basicAck(deliveryTag, false);
            log.warn("Verification message rejected jobId={} retry={} reason={}", jobId, retry, e.getMessage());
            System.err.println(">>> [ASSET-WORKER] nack | jobId=" + jobId + " deliveryTag=" + deliveryTag);
        }
    }

    private boolean isOwnedByDeletingAccount(AssetVerificationMessage message) {
        if (message == null || message.getProfileId() == null) {
            return false;
        }
        try {
            return accountDeletionStateService.hasDeletionStarted(
                    UUID.fromString(message.getProfileId())
            );
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
