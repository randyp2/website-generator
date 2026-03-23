package com.webgen.webgen_backend.portfolio_service.builder;

import com.webgen.webgen_backend.dto.portfolio.builder.BuilderRequestDTO;
import com.webgen.webgen_backend.dto.portfolio.builder.BuilderResponseDTO;
import com.webgen.webgen_backend.portfolio_service.job.SectionGenerationMessage;

import java.util.UUID;

public interface BuilderService {
    BuilderResponseDTO build(BuilderRequestDTO req, UUID userId);


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
