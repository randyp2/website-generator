package com.webgen.webgen_backend.portfolio.model.screenshot;

/** Lifecycle of an external website screenshot requested before publication. */
public enum SitePreviewStatus {
    NOT_REQUESTED,
    QUEUED,
    CAPTURING,
    READY,
    FAILED
}
