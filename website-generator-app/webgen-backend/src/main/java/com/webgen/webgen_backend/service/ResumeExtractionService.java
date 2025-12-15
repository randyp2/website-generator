package com.webgen.webgen_backend.service;

import com.webgen.webgen_backend.model.ParsedResume;

public interface ResumeExtractionService {
    /**
     * Identify and populate semantic fields:
     * - Personal Info
     * - Work Experience
     * etc.
     *
     * @param normalizedText
     *        normalized, human-readable text acquired after cleaning up rawtext
     * @return a ParsedResume instance containing structure resume data
     *
     */
    ParsedResume extract(String normalizedText);

}
