package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.dto.profile.verification.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.dto.profile.verification.UploadResumeVerificationRequestDTO;
import com.webgen.webgen_backend.entity.Profile;
import com.webgen.webgen_backend.entity.ResumeVerification;
import com.webgen.webgen_backend.mapper.ResumeVerificationMapper;
import com.webgen.webgen_backend.repository.ProfileRepository;
import com.webgen.webgen_backend.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.resume_verification_service.ResumeVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeVerificationServiceImpl implements ResumeVerificationService {

    private final ProfileRepository profileRepository;
    private final ResumeVerificationRepository resumeVerificationRepository;
    private final ResumeVerificationMapper resumeVerificationMapper;

    @Override
    public ResumeVerificationDTO uploadResumeVerification(UUID userId, UploadResumeVerificationRequestDTO request) {
        System.out.println(">>> [RESUME VERIFICATION SERVICE] entered upload resume verification serviced");
        validateRequest(request);
        Profile profile = resolveOrCreateProfile(userId);

        OffsetDateTime now = OffsetDateTime.now();

        ResumeVerification resumeVerification = resumeVerificationRepository.findByProfileId(userId)
                .orElseGet(() -> {
                    ResumeVerification entity = new ResumeVerification();
                    entity.setId(UUID.randomUUID());
                    entity.setProfile(profile);
                    entity.setCreatedAt(now);
                    return entity;
                });

        if (resumeVerification.getCreatedAt() == null) {
            resumeVerification.setCreatedAt(now);
        }

        resumeVerification.setProfile(profile);
        resumeVerification.setRawFileBucket(request.getRawFileBucket());
        resumeVerification.setRawFilePath(request.getRawFilePath());
        resumeVerification.setOriginalFileName(request.getOriginalFileName());
        resumeVerification.setContentType(request.getContentType());
        resumeVerification.setFileSizeBytes(request.getFileSizeBytes());
        resumeVerification.setUpdatedAt(now);

        ResumeVerification saved = resumeVerificationRepository.save(resumeVerification);
        System.out.println(">>> [RESUME VERIFICATION SERVICE] successfully saved");
        return resumeVerificationMapper.toDto(saved);
    }

    @Override
    public ResumeVerificationDTO updateParsedData(UUID userId, UpdateResumeVerificationParsedDTO request) {
        ResumeVerification resumeVerification = resumeVerificationRepository.findByProfileId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No resume verification found for this user"));

        resumeVerification.setExtractedText(request.getExtractedText());
        resumeVerification.setParsedJson(request.getParsedJson());
        resumeVerification.setUpdatedAt(OffsetDateTime.now());

        ResumeVerification saved = resumeVerificationRepository.save(resumeVerification);
        return resumeVerificationMapper.toDto(saved);
    }

    private Profile resolveOrCreateProfile(UUID userId) {
        return profileRepository.findById(userId).orElseGet(() -> {
            Profile profile = new Profile();
            profile.setId(userId);
            return profileRepository.save(profile);
        });
    }

    private void validateRequest(UploadResumeVerificationRequestDTO request) {
        System.out.println(">>> [RESUME VERIFICATION SERVICE] request validating...");
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        if (!StringUtils.hasText(request.getRawFileBucket())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rawFileBucket is required");
        }

        if (!StringUtils.hasText(request.getRawFilePath())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rawFilePath is required");
        }

        if (!StringUtils.hasText(request.getOriginalFileName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "originalFileName is required");
        }

        if (!StringUtils.hasText(request.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contentType is required");
        }

        if (request.getFileSizeBytes() == null || request.getFileSizeBytes() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fileSizeBytes must be >= 0");
        }
        System.out.println(">>> [RESUME VERIFICATION SERVICE] request validated!");
    }
}
