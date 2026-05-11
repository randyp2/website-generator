package com.webgen.webgen_backend.verification.service.job;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationEnqueueDTO;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationJobStatusDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetVerificationJobService {

    // Config for redis
    private static final String KEY_PREFIX = "verify:job:";
    private static final Duration TTL = Duration.ofHours(24);

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Creates a job in Redis and immediately publishes an asset verification message to RabbitMQ
     * for a verification worker to pick up.
     *
     * @param enqueueDTO verification payload forwarded to the worker
     * @return newly created jobId for status polling
     */
    public String createJobAndQueue(AssetVerificationEnqueueDTO enqueueDTO) {
        String jobId = createJob(enqueueDTO);

        AssetVerificationMessage msg = AssetVerificationMessage.builder()
                .jobId(jobId)
                .uploadId(enqueueDTO.getUploadId().toString())
                .claimId(enqueueDTO.getClaimId().toString())
                .profileId(enqueueDTO.getProfileId().toString())
                .storageProvider(enqueueDTO.getStorageProvider())
                .storageBucket(enqueueDTO.getStorageBucket())
                .storageKey(enqueueDTO.getStorageKey())
                .fileSizeBytes(enqueueDTO.getFileSizeBytes())
                .queuedAt(OffsetDateTime.now().toString())
                .build();

        // Publish message to exchange
        // RabbitMQ sends to queue
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ASSET_VERIFICATION_ROUTING_KEY,
                msg
        );

        return jobId;
    }

    /**
     * Generate a job and save to redis in order to keep track of status
     *
     * @param enqueueDTO verification payload that this job is related to
     * @return the jobId of the job that was saved
     */
    public String createJob(AssetVerificationEnqueueDTO enqueueDTO) {
        String jobId = UUID.randomUUID().toString();

        AssetVerificationJobStatusDTO status = AssetVerificationJobStatusDTO.builder()
                .jobId(jobId)
                .uploadId(enqueueDTO.getUploadId().toString())
                .claimId(enqueueDTO.getClaimId().toString())
                .profileId(enqueueDTO.getProfileId().toString())
                .status(AssetVerificationJobStatusDTO.Status.QUEUED)
                .error("")
                .build();

        saveToRedis(status);
        return jobId;
    }

    /**
     * Updates the top-level status field on the job record (QUEUED, PROCESSING, COMPLETED, FAILED).
     * No-ops silently if the job no longer exists in Redis.
     *
     * @param jobId  active job ID
     * @param status new status to apply
     */
    public void updateStatus(String jobId, AssetVerificationJobStatusDTO.Status status) {
        AssetVerificationJobStatusDTO job = getJob(jobId);
        if (job == null) return;

        // Update and save
        job.setStatus(status);
        saveToRedis(job);
    }

    public AssetVerificationJobStatusDTO getJob(String jobId) {
        String key = KEY_PREFIX + jobId;

        // Get value from redis
        String jsonValue = redisTemplate.opsForValue().get(key);

        if (jsonValue == null)
            return null;
        try {
            return objectMapper.readValue(jsonValue, AssetVerificationJobStatusDTO.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    /**
     * Save a key, value pair to redis client where:
     * KEY = PREFIX KEY + jobId
     * VALUE = serialized jobStatusDTO
     *
     * @param statusDTO DTO containing metadata of a job's status
     * @throws RuntimeException if the job fails to serialize into json String
     */
    private void saveToRedis(AssetVerificationJobStatusDTO statusDTO) {
        try {
            // Write the value as a json string
            String jsonValue = objectMapper.writeValueAsString(statusDTO);

            // Write to redis client
            String key = KEY_PREFIX + statusDTO.getJobId();
            redisTemplate.opsForValue().set(key, jsonValue, TTL);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize job status", e);
        }
    }

    // Fail the job and update the status
    public void failJob(String jobId, String message) {
        AssetVerificationJobStatusDTO status = getJob(jobId);
        if (status == null) return;

        status.setError(message);
        status.setStatus(AssetVerificationJobStatusDTO.Status.FAILED);
        saveToRedis(status);
    }
}
