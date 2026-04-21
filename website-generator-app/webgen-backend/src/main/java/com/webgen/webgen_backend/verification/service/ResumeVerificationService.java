package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.ResumeVerificationDTO;
import com.webgen.webgen_backend.verification.dto.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.verification.dto.UploadResumeVerificationRequestDTO;

import java.util.UUID;

public interface ResumeVerificationService {
    ResumeVerificationDTO getResumeVerification(UUID userId);
    ResumeVerificationDTO uploadResumeVerification(UUID userId, UploadResumeVerificationRequestDTO request);
    ResumeVerificationDTO updateParsedData(UUID userId, UpdateResumeVerificationParsedDTO request);
    ResumeVerificationDTO deleteResumeVerification(UUID userId);
}
