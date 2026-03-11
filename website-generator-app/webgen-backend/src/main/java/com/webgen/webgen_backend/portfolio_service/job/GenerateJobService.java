package com.webgen.webgen_backend.portfolio_service.job;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.JobStatusDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
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

    public void updateStatus(String jobId, JobStatusDTO.Status status) {
        JobStatusDTO jobStatusDTO = getJob(jobId);
        if (jobStatusDTO == null) return;

        jobStatusDTO.setStatus(status);
        saveToRedis(jobStatusDTO);
    }

    public JobStatusDTO getJob(String jobId) {
        String key = KEY_PREFIX + jobId;

        // Get value from redis
        String jsonValue = redisTemplate.opsForValue().get(key);

        if (jsonValue == null) return null;
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

