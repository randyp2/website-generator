package com.webgen.webgen_backend.portfolio.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Thrown when an approved plan no longer matches the portfolio's persisted
 * sections (e.g. a "modify" targets a section that was deleted after the plan
 * was made). Maps to 409 CONFLICT so clients can prompt the user to re-plan
 * instead of executing changes against data the plan never saw.
 */
public class RefinePlanConflictException extends ResponseStatusException {

    public RefinePlanConflictException(String detail) {
        super(HttpStatus.CONFLICT,
                "The portfolio changed since this plan was made (" + detail + "). Please request the change again.");
    }
}
