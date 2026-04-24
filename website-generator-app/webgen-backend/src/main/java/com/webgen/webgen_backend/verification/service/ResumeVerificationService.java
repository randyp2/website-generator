package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.ResumeVerificationDTO;
import com.webgen.webgen_backend.verification.dto.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.verification.dto.UploadResumeVerificationRequestDTO;

import java.util.UUID;

public interface ResumeVerificationService {

    /**
     * Fetches the resume verification record for the authenticated user.
     *
     * @param userId authenticated user id
     * @return the current resume verification state
     */
    ResumeVerificationDTO getResumeVerification(UUID userId);

    /**
     * Stores a new resume verification upload for the authenticated user.
     * Creates or replaces the existing resume verification record.
     *
     * @param userId  authenticated user id
     * @param request upload metadata including file path and bucket location
     * @return the saved resume verification state
     */
    ResumeVerificationDTO uploadResumeVerification(UUID userId, UploadResumeVerificationRequestDTO request);

    /**
     * Updates the parsed skill data on an existing resume verification record.
     * Called after LLM extraction completes to store structured skill claims.
     *
     * @param userId  authenticated user id
     * @param request parsed data payload to apply to the existing record
     * @return the updated resume verification state
     */
    ResumeVerificationDTO updateParsedData(UUID userId, UpdateResumeVerificationParsedDTO request);

    /**
     * Deletes the resume verification record for the authenticated user.
     *
     * @param userId authenticated user id
     * @return the deleted resume verification state captured before removal
     */
    ResumeVerificationDTO deleteResumeVerification(UUID userId);
}
