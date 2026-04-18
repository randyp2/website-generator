package com.webgen.webgen_backend.portfolio.dto;

import lombok.Data;

@Data
public class JobStatusDTO {

    /* --- LIST OF POSSIBLE JOB STATUS --- */
    public enum Status {
        QUEUED, // queued but not handled yet
        PROCESSING, // Polled by worker
        REFINING_PROMPT,
        GENERATING, // Generating react source code
        VALIDATING, // Validating w/ jsx compiler
        RETRYING,
        PERSISTING, // Saving to DB
        COMPLETED,
        FAILED
    }

    private String jobId;
    private String portfolioId;
    private Status status;
    private int completedCount;
    private int totalSections;
    private String error;
}
