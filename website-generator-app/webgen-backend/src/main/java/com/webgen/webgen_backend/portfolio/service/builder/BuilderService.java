package com.webgen.webgen_backend.portfolio.service.builder;

import com.webgen.webgen_backend.portfolio.dto.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio.service.job.SectionGenerationMessage;

import java.util.UUID;

public interface BuilderService {

    /**
     * Validates an approved refine plan and queues its actionable section work.
     *
     * @param req approved refine build request
     * @param userId authenticated user id
     * @param creditReservationId credit reservation attached to queued section work
     * @return job response used for status polling
     */
    BuilderResponseDTO build(BuilderRequestDTO req, UUID userId, UUID creditReservationId);


    /**
     * Process a single REFINE message from section queue
     * Called by the RabbitMQ consumer - Runs in parallel w/ other workers
     *
     * Same logic as one shot generation portfolio:
     *  build prompt -> LLM -> parse -> validate -> push to redis -> incr counter
     *
     * @param msg - Message to process
     */
    void refineSingleSectionFromQueue(SectionGenerationMessage msg);

}
