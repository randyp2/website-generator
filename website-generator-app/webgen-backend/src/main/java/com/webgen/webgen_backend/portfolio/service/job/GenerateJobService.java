package com.webgen.webgen_backend.portfolio.service.job;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.shared.config.RabbitMQConfig;
import com.webgen.webgen_backend.portfolio.dto.*;
import com.webgen.webgen_backend.portfolio.dto.common.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * CRUD SERVICE LAYER
 * - Generates & Updates jobs stored in redis client
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GenerateJobService {

    // Key, value config
    private static final String KEY_PREFIX = "gen:job:";
    private static final Duration TTL = Duration.ofMinutes(15);
    private static final String TTL_MILLIS = String.valueOf(TTL.toMillis());
    private static final DefaultRedisScript<Long> UPDATE_STATUS_SCRIPT = redisScript("""
            local raw = redis.call('GET', KEYS[1])
            if not raw then
                return -1
            end

            local job = cjson.decode(raw)
            if job.status == 'COMPLETED' or job.status == 'FAILED' then
                return 0
            end

            job.status = ARGV[1]
            redis.call('SET', KEYS[1], cjson.encode(job), 'PX', ARGV[2])
            return 1
            """);
    private static final DefaultRedisScript<Long> INCREMENT_COMPLETED_SCRIPT = redisScript("""
            local raw = redis.call('GET', KEYS[1])
            if not raw then
                return -1
            end

            local job = cjson.decode(raw)
            if job.status == 'COMPLETED' or job.status == 'FAILED' then
                return -2
            end

            local count = 1
            if type(job.completedCount) == 'number' then
                count = job.completedCount + 1
            end
            job.completedCount = count
            redis.call('SET', KEYS[1], cjson.encode(job), 'PX', ARGV[1])
            return count
            """);
    private static final DefaultRedisScript<Long> SET_TOTAL_SECTIONS_SCRIPT = redisScript("""
            local raw = redis.call('GET', KEYS[1])
            if not raw then
                return -1
            end

            local job = cjson.decode(raw)
            if job.status == 'COMPLETED' or job.status == 'FAILED' then
                return 0
            end

            job.totalSections = tonumber(ARGV[1])
            redis.call('SET', KEYS[1], cjson.encode(job), 'PX', ARGV[2])
            return 1
            """);
    private static final DefaultRedisScript<Long> FAIL_JOB_SCRIPT = redisScript("""
            local raw = redis.call('GET', KEYS[1])
            if not raw then
                return -1
            end

            local job = cjson.decode(raw)
            if job.status == 'COMPLETED' or job.status == 'FAILED' then
                return 0
            end

            job.error = ARGV[1]
            job.status = 'FAILED'
            redis.call('SET', KEYS[1], cjson.encode(job), 'PX', ARGV[2])
            return 1
            """);
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Creates a job in Redis and immediately publishes a generation message to RabbitMQ
     * for an orchestration worker to pick up.
     *
     * @param portfolioId portfolio to generate for
     * @param userId      authenticated user id for ownership checks inside the worker
     * @param creditReservationId credit reservation to refund if queued work fails
     * @param req         original generation request forwarded to the worker
     * @return newly created jobId for status polling
     */
    public String createJobAndQueue(
            UUID portfolioId,
            UUID userId,
            UUID creditReservationId,
            PortfolioGenerateRequestDTO req) {
        String jobId = createJob(portfolioId);

        PortfolioGenerationMessage msg = PortfolioGenerationMessage.builder()
                .jobId(jobId)
                .portfolioId(portfolioId.toString())
                .userId(userId.toString())
                .creditReservationId(creditReservationId)
                .req(req)
                .build();

        // Publish message to exchange
        // RabbitMQ sends to queue
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                msg
        );

        return jobId;

    }

    /**
     * Generate a job and save to redis in order to keep track of status
     *
     * @param portfolioId - portfolio that this job is related to
     * @return the jobId of the job that was saved
     */
    public String createJob(UUID portfolioId) {
        String jobId = UUID.randomUUID().toString();

        JobStatusDTO status = JobStatusDTO.builder()
                        .jobId(jobId)
                        .portfolioId(portfolioId.toString())
                        .status(JobStatusDTO.Status.QUEUED)
                        .completedCount(0)
                        .totalSections(0)
                        .error("")
                        .build();

        saveToRedis(status);
        return jobId;
    }

    /**
     * Fan out section generation messages to the section queue.
     * Called by the orchestrator
     *
     * @param messages List of messages to publish to the portfolio.section.queue
     */
    public void fanOutSections(List<SectionGenerationMessage> messages) {
        for (SectionGenerationMessage msg : messages) {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.SECTION_ROUTING_KEY,
                    msg
            );
        }
    }

    /**
     * Appends a completed section's JSON to the Redis list for this job.
     * The frontend polls this list to stream section results as they complete.
     *
     * @param jobId      active job ID
     * @param sectionDTO completed section to serialize and store
     */
    public void pushCompletedSection(String jobId, SectionDTO sectionDTO) {
        try {
            String sectionJson = objectMapper.writeValueAsString(sectionDTO);
            String key = KEY_PREFIX + jobId + ":sections";

            // Push to a redis list
            redisTemplate.opsForList().rightPush(key, sectionJson);
            redisTemplate.expire(key, TTL);
        } catch (JsonProcessingException e) {
            log.error("Failed to push completed section jobId={} reason={}", jobId, e.getMessage(), e);
        }
    }

    /**
     * Fetches newly completed sections starting at the given offset, supporting
     * incremental polling by the frontend without re-fetching already seen sections.
     *
     * @param jobId  active job ID
     * @param offset index of the first new section to return
     * @return JSON strings of sections from offset to end of the list
     */
    public List<String> getCompletedSections(String jobId, long offset) {
        String key = KEY_PREFIX + jobId + ":sections";
        Long size = redisTemplate.opsForList().size(key);
        if (size == null || size <= offset) {
            return List.of();
        }

        // Query the list
        List<String> resultSections = redisTemplate.opsForList().range(key, offset, -1);
        return resultSections != null ? resultSections : List.of();
    }

    /**
     * Updates the job status atomically. COMPLETED and FAILED are terminal, so
     * a delayed concurrent worker cannot move the job back into a running state.
     *
     * @param jobId  active job ID
     * @param status new status to apply
     */
    public void updateStatus(String jobId, JobStatusDTO.Status status) {
        redisTemplate.execute(
                UPDATE_STATUS_SCRIPT,
                List.of(jobKey(jobId)),
                status.name(),
                TTL_MILLIS
        );
    }

    /**
     * Atomically increments the completed section count and updates the job
     * snapshot in the same Redis operation. Terminal jobs are left unchanged.
     *
     * @param jobId Active job ID
     * @return the new completed count (atomic, safe for barrier checks)
     */
    public int incrementCompleted(String jobId) {
        Long newCount = redisTemplate.execute(
                INCREMENT_COMPLETED_SCRIPT,
                List.of(jobKey(jobId)),
                TTL_MILLIS
        );
        return newCount != null ? newCount.intValue() : -1;
    }

    /**
     * Records the total number of sections being generated so the frontend can
     * show a progress fraction (completedCount / totalSections).
     *
     * @param jobId active job ID
     * @param total total number of section generation tasks fanned out
     */
    public void setTotalSections(String jobId, int total) {
        redisTemplate.execute(
                SET_TOTAL_SECTIONS_SCRIPT,
                List.of(jobKey(jobId)),
                String.valueOf(total),
                TTL_MILLIS
        );
    }

    /**
     * Store section keys marked for deletion at fan-out time.
     * The barrier worker reads these at persistence time to delete sections.
     */
    public void storeDeleteKeys(String jobId, List<String> deleteKeys) {
        if (deleteKeys == null || deleteKeys.isEmpty()) return;

        String key = KEY_PREFIX + jobId + ":deleteKeys";
        for (String sectionKey : deleteKeys) {
            redisTemplate.opsForList().rightPush(key, sectionKey);
        }
        redisTemplate.expire(key, TTL);
    }

    /**
     * Retrieve section keys marked for deletion.
     * Called by the barrier worker during persistence.
     */
    public List<String> getDeleteKeys(String jobId) {
        String key = KEY_PREFIX + jobId + ":deleteKeys";
        List<String> keys = redisTemplate.opsForList().range(key, 0, -1);
        return keys != null ? keys : List.of();
    }

    /**
     * Marks the job as FAILED and stores the error in one atomic operation.
     * Existing COMPLETED and FAILED states remain unchanged.
     *
     * @param jobId active job ID
     * @param error human-readable error description
     */
    public void failJob(String jobId, String error) {
        redisTemplate.execute(
                FAIL_JOB_SCRIPT,
                List.of(jobKey(jobId)),
                error,
                TTL_MILLIS
        );
    }

    /**
     * Retrieves the current job status from Redis.
     *
     * @param jobId active job ID
     * @return job status DTO, or null if not found or deserialization fails
     */
    public JobStatusDTO getJob(String jobId) {
        String key = KEY_PREFIX + jobId;

        // Get value from redis
        String jsonValue = redisTemplate.opsForValue().get(key);

        if (jsonValue == null)
            return null;
        try {
            return objectMapper.readValue(jsonValue, JobStatusDTO.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    /**
     * Save a key, value pair to redis client where:
     * KEY = PREFIX KEY + jobId
     * VALUE = serialized jobStatusDTO
     *
     * @param jobStatusDTO DTO containing metadata of a job's status
     * @throws RuntimeException if the job fails to serialize into json String
     */
    private void saveToRedis(JobStatusDTO jobStatusDTO) {
        try {
            // Write the value as a json string
            String jsonValue = objectMapper.writeValueAsString(jobStatusDTO);

            // Write to redis client
            String key = KEY_PREFIX + jobStatusDTO.getJobId();
            redisTemplate.opsForValue().set(key, jsonValue, TTL);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize job status", e);
        }
    }

    private static DefaultRedisScript<Long> redisScript(String source) {
        return new DefaultRedisScript<>(source, Long.class);
    }

    private static String jobKey(String jobId) {
        return KEY_PREFIX + jobId;
    }

}
