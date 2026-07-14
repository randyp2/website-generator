package com.webgen.webgen_backend.portfolio.service.verification;

/** Indicates that a public verification page could not be fetched safely. */
public class SiteVerificationPageFetchException extends RuntimeException {

    public SiteVerificationPageFetchException(String message) {
        super(message);
    }

    public SiteVerificationPageFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
