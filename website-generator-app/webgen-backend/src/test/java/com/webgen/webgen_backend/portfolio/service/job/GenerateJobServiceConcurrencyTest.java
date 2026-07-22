package com.webgen.webgen_backend.portfolio.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.JobStatusDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GenerateJobServiceConcurrencyTest {

    private RedisTemplate<String, String> redisTemplate;
    private GenerateJobService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(RedisTemplate.class);
        service = new GenerateJobService(
                redisTemplate,
                new ObjectMapper(),
                mock(RabbitTemplate.class)
        );
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void statusUpdateUsesOneAtomicScriptAndProtectsTerminalStates() {
        service.updateStatus("job-123", JobStatusDTO.Status.GENERATING);

        ArgumentCaptor<RedisScript> scriptCaptor = ArgumentCaptor.forClass(RedisScript.class);
        verify(redisTemplate).execute(
                scriptCaptor.capture(),
                eq(List.of("gen:job:job-123")),
                eq("GENERATING"),
                eq("900000")
        );

        String script = scriptCaptor.getValue().getScriptAsString();
        assertTrue(script.contains("job.status == 'COMPLETED'"));
        assertTrue(script.contains("job.status == 'FAILED'"));
        assertTrue(script.contains("redis.call('SET'"));
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void completedCountChangesInsideTheAtomicJobScript() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                org.mockito.ArgumentMatchers.<String>anyList(),
                any(Object.class)
        ))
                .thenReturn(3L);

        int completed = service.incrementCompleted("job-123");

        ArgumentCaptor<RedisScript> scriptCaptor = ArgumentCaptor.forClass(RedisScript.class);
        verify(redisTemplate).execute(
                scriptCaptor.capture(),
                eq(List.of("gen:job:job-123")),
                eq("900000")
        );

        String script = scriptCaptor.getValue().getScriptAsString();
        assertTrue(script.contains("count = job.completedCount + 1"));
        assertTrue(script.contains("job.completedCount = count"));
        assertEquals(3, completed);
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void failureTransitionIsAtomicAndCannotReplaceAnotherTerminalState() {
        service.failJob("job-123", "section footer failed");

        ArgumentCaptor<RedisScript> scriptCaptor = ArgumentCaptor.forClass(RedisScript.class);
        verify(redisTemplate).execute(
                scriptCaptor.capture(),
                eq(List.of("gen:job:job-123")),
                eq("section footer failed"),
                eq("900000")
        );

        String script = scriptCaptor.getValue().getScriptAsString();
        assertTrue(script.contains("job.status == 'COMPLETED'"));
        assertTrue(script.contains("job.status == 'FAILED'"));
        assertTrue(script.contains("job.status = 'FAILED'"));
        assertTrue(script.contains("job.error = ARGV[1]"));
    }
}
