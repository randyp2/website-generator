package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.dto.profile.verification.UploadResumeVerificationRequestDTO;

import java.util.UUID;

public interface ResumeVerificationService {
    ResumeVerificationDTO uploadResumeVerification(UUID userId, UploadResumeVerificationRequestDTO request);
}
