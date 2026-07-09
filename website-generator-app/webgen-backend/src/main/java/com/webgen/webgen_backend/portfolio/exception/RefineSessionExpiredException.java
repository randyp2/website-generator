package com.webgen.webgen_backend.portfolio.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when a refine step references a clarifier session that no longer
 * exists in Redis (TTL expiry or restart). Maps to 410 GONE so clients can
 * distinguish an expired conversation from a server failure and prompt the
 * user to restate their request.
 */
public class RefineSessionExpiredException extends ResponseStatusException {

    public RefineSessionExpiredException() {
        super(HttpStatus.GONE, "Your revision session has expired. Please restate your request.");
    }
}
