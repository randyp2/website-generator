package com.webgen.webgen_backend.service;

import com.webgen.webgen_backend.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.model.ParsedResume;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeParserService {


    /**
     * Parses an uploaded resume file and returns structured resume data.
     *
     * @param file uploaded resume (PDF)
     * @return ParsedResumeDTO containing extracted information
     */
    ParsedResumeDTO parseResume(MultipartFile file);
}
