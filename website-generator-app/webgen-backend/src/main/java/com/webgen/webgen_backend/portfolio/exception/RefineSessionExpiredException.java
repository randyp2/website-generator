package com.webgen.webgen_backend.portfolio.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when a refine step references a workflow or clarifier session that
 * no longer exists or has expired. Maps to 410 GONE so clients can
 * distinguish an expired conversation from a server failure and prompt the
 * user to restate their request.
 */
public class RefineSessionExpiredException extends ResponseStatusException {

    public RefineSessionExpiredException() {
        super(HttpStatus.GONE, "Your revision session has expired. Please restate your request.");
    }

    /** Creates a gone response with a more specific session closure reason. */
    public RefineSessionExpiredException(String reason) {
        super(HttpStatus.GONE, reason);
    }
}
