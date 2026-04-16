package com.webgen.webgen_backend.controller.profile;

import com.webgen.webgen_backend.dto.profile.verification.summary.VerificationSummaryDTO;
import com.webgen.webgen_backend.dto.profile.verification.evidence.EvidenceListResponseDTO;
import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.dto.profile.verification.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.dto.profile.verification.UploadResumeVerificationRequestDTO;
import com.webgen.webgen_backend.resume_verification_service.EvidenceQueryService;
import com.webgen.webgen_backend.resume_verification_service.ResumeVerificationService;
import com.webgen.webgen_backend.resume_verification_service.SkillVerificationSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/resume-verification")
@RequiredArgsConstructor
public class ProfileResumeVerificationController {

    private final ResumeVerificationService resumeVerificationService;
    private final SkillVerificationSummaryService skillVerificationSummaryService;
    private final EvidenceQueryService evidenceQueryService;

    @GetMapping
    public ResponseEntity<ResumeVerificationDTO> getResumeVerification() {
        UUID userId = resolveAuthenticatedUserId();
        ResumeVerificationDTO response = resumeVerificationService.getResumeVerification(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<VerificationSummaryDTO> getSkillVerificationSummary() {
        UUID userId = resolveAuthenticatedUserId();
        VerificationSummaryDTO response = skillVerificationSummaryService.getSkillVerificationSummary(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/evidence")
    public ResponseEntity<EvidenceListResponseDTO> getEvidence(
            @RequestParam(required = false) String provider
    ) {
        UUID userId = resolveAuthenticatedUserId();
        EvidenceListResponseDTO response = evidenceQueryService.getEvidence(userId, provider);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<ResumeVerificationDTO> uploadResumeForVerification(
            @RequestBody UploadResumeVerificationRequestDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        ResumeVerificationDTO response = resumeVerificationService.uploadResumeVerification(userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/parsed")
    public ResponseEntity<ResumeVerificationDTO> updateParsedData(
            @RequestBody UpdateResumeVerificationParsedDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        ResumeVerificationDTO response = resumeVerificationService.updateParsedData(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ResumeVerificationDTO> deleteResumeVerification() {
        UUID userId = resolveAuthenticatedUserId();
        ResumeVerificationDTO response = resumeVerificationService.deleteResumeVerification(userId);
        return ResponseEntity.ok(response);
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
