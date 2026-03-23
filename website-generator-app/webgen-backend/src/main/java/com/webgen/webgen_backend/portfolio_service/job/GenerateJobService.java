package com.webgen.webgen_backend.portfolio_service.job;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.config.RabbitMQConfig;
import com.webgen.webgen_backend.dto.portfolio.*;

import lombok.RequiredArgsConstructor;


import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
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
public class GenerateJobService {

    // Key, value config
    private static final String KEY_PREFIX = "gen:job:";
    private static final Duration TTL = Duration.ofMinutes(15);
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RabbitTemplate rabbitTemplate;

    // Create and queue a generation job for a worker to pick up
    public String createJobAndQueue(
            UUID portfolioId,
            UUID userId,
            PortfolioGenerateRequestDTO req) {
        String jobId = createJob(portfolioId);

        PortfolioGenerationMessage msg = new PortfolioGenerationMessage(
                jobId,
                portfolioId.toString(),
                userId.toString(),
                req
        );

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

        JobStatusDTO status = new JobStatusDTO();
        status.setJobId(jobId);
        status.setPortfolioId(portfolioId.toString());
        status.setStatus(JobStatusDTO.Status.QUEUED);
        status.setCompletedCount(0);
        status.setTotalSections(0);

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

//     /**
//     * Fan out section generation messages to the section queue.
//     * Called by the orchestrator after blueprint generation is complete.
//     * Publishes one message per section in the blueprint's section plan,
//     * allowing multiple workers to generate sections in parallel.
//     *
//     * @param jobId         Active job ID (already exists in Redis)
//     * @param portfolioId   Portfolio being generated
//     * @param userId        Owner of the portfolio
//     * @param req           Original generation request (resume, style prefs, prompt)
//     * @param refinedPrompt Refined prompt providing global design direction
//     * @param blueprint     Blueprint containing section plan and design directive
//     */
//    public void fanOutSections(
//            String jobId, String portfolioId, String userId,
//            PortfolioGenerateRequestDTO req, String refinedPrompt, BlueprintDTO blueprint
//    ) {
//        List<BlueprintSectionPlanDTO> plan = blueprint.getSectionPlan();
//
//        for (BlueprintSectionPlanDTO p : plan) {
//            SectionGenerationMessage msg = new SectionGenerationMessage(
//                    jobId, portfolioId, userId,
//                    req, refinedPrompt, blueprint,
//                    p, plan.size()
//            );
//
//            rabbitTemplate.convertAndSend(
//                    RabbitMQConfig.EXCHANGE,
//                    RabbitMQConfig.SECTION_ROUTING_KEY,
//                    msg
//            );
//        }
//    }

    // Push a completed section job to a list
    public void pushCompletedSection(String jobId, SectionDTO sectionDTO) {
        try {
            String sectionJson = objectMapper.writeValueAsString(sectionDTO);
            String key = KEY_PREFIX + jobId + ":sections";

            // Push to a redis list
            redisTemplate.opsForList().rightPush(key, sectionJson);
            redisTemplate.expire(key, TTL);
        } catch (JsonProcessingException e) {

            System.err.println(">>> [JOB] Failed to push completed section job");
        }
    }

    // Get the list of compeleted sections
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

    public void updateStatus(String jobId, JobStatusDTO.Status status) {
        // Job check
        JobStatusDTO jobStatusDTO = getJob(jobId);
        if (jobStatusDTO == null)
            return;

        // Update and save
        jobStatusDTO.setStatus(status);
        saveToRedis(jobStatusDTO);
    }

    /**
     * Atomically increment the completed section count using Redis INCR.
     * Uses a dedicated key for thread safety across parallel workers.
     * Also best-effort updates the JobStatusDTO completedCount for client polling.
     *
     * @param jobId Active job ID
     * @return the new completed count (atomic, safe for barrier checks)
     */
    public int incrementCompleted(String jobId) {
        // Atomic increment via Redis INCR — safe across concurrent workers
        String atomicKey = KEY_PREFIX + jobId + ":completedCount";
        Long newCount = redisTemplate.opsForValue().increment(atomicKey);
        redisTemplate.expire(atomicKey, TTL);

        // Best-effort update of JobStatusDTO for client polling display
        JobStatusDTO jobStatusDTO = getJob(jobId);
        if (jobStatusDTO != null) {
            jobStatusDTO.setCompletedCount(newCount != null ? newCount.intValue() : 0);
            saveToRedis(jobStatusDTO);
        }

        return newCount != null ? newCount.intValue() : -1;
    }

    public void setTotalSections(String jobId, int total) {
        JobStatusDTO jobStatusDTO = getJob(jobId);
        if (jobStatusDTO == null)
            return;

        jobStatusDTO.setTotalSections(total);
        saveToRedis(jobStatusDTO);
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

    public void failJob(String jobId, String error) {
        JobStatusDTO jobStatusDTO = getJob(jobId);
        if (jobStatusDTO == null)
            return;

        jobStatusDTO.setError(error);
        jobStatusDTO.setStatus(JobStatusDTO.Status.FAILED);
        saveToRedis(jobStatusDTO);
    }

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

}
