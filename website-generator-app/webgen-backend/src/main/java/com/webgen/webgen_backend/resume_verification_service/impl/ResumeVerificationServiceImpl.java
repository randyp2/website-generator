package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.entity.Profile;
import com.webgen.webgen_backend.entity.ResumeVerification;
import com.webgen.webgen_backend.mapper.ResumeVerificationMapper;
import com.webgen.webgen_backend.repository.ProfileRepository;
import com.webgen.webgen_backend.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.resume_verification_service.ResumeVerificationService;
import com.webgen.webgen_backend.resume_verification_service.ResumeVerificationStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeVerificationServiceImpl implements ResumeVerificationService {

    private final ProfileRepository profileRepository;
    private final ResumeVerificationRepository resumeVerificationRepository;
    private final ResumeVerificationMapper resumeVerificationMapper;
    private final ResumeVerificationStorageService resumeVerificationStorageService;

    @Override
    public ResumeVerificationDTO uploadResumeVerification(UUID userId, MultipartFile file) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        ResumeVerificationStorageService.UploadResult uploadResult =
                resumeVerificationStorageService.uploadResume(userId, file);

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
        resumeVerification.setRawFileUrl(uploadResult.publicUrl());
        resumeVerification.setOriginalFileName(uploadResult.originalFileName());
        resumeVerification.setContentType(uploadResult.contentType());
        resumeVerification.setFileSizeBytes(uploadResult.fileSizeBytes());
        resumeVerification.setUpdatedAt(now);

        ResumeVerification saved = resumeVerificationRepository.save(resumeVerification);
        return resumeVerificationMapper.toDto(saved);
    }
}
