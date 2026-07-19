package com.webgen.webgen_backend.verification.service;

import java.util.UUID;

/** Retracts derived evidence when its source is removed. */
public interface EvidenceRetractionService {

    int retractUpload(UUID profileId, UUID uploadId);

    int retractProvider(UUID profileId, String provider);
}
