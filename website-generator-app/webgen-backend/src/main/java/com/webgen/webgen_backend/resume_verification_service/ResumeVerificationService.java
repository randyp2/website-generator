package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.dto.profile.verification.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.dto.profile.verification.UploadResumeVerificationRequestDTO;

import java.util.UUID;

public interface ResumeVerificationService {
    ResumeVerificationDTO getResumeVerification(UUID userId);
    ResumeVerificationDTO uploadResumeVerification(UUID userId, UploadResumeVerificationRequestDTO request);
    ResumeVerificationDTO updateParsedData(UUID userId, UpdateResumeVerificationParsedDTO request);
    ResumeVerificationDTO deleteResumeVerification(UUID userId);
}
