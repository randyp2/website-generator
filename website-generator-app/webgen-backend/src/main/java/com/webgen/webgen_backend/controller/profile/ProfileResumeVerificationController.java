package com.webgen.webgen_backend.controller.profile;

import com.webgen.webgen_backend.dto.profile.verification.AddSkillClaimRequestDTO;
import com.webgen.webgen_backend.dto.profile.verification.ClaimDTO;
import com.webgen.webgen_backend.dto.profile.verification.IngestSkillClaimsRequestDTO;
import com.webgen.webgen_backend.dto.profile.verification.ResumeVerificationDTO;
import com.webgen.webgen_backend.dto.profile.verification.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.dto.profile.verification.UploadResumeVerificationRequestDTO;
import com.webgen.webgen_backend.resume_verification_service.ClaimIngestionService;
import com.webgen.webgen_backend.resume_verification_service.ResumeVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/resume-verification")
@RequiredArgsConstructor
public class ProfileResumeVerificationController {

    private final ResumeVerificationService resumeVerificationService;
    private final ClaimIngestionService claimIngestionService;

    @GetMapping
    public ResponseEntity<ResumeVerificationDTO> getResumeVerification() {
        UUID userId = resolveAuthenticatedUserId();
        ResumeVerificationDTO response = resumeVerificationService.getResumeVerification(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
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

    @PostMapping("/claims/ingest")
    public ResponseEntity<Integer> ingestSkillClaims(
            @RequestBody IngestSkillClaimsRequestDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        int upserted = claimIngestionService.ingestSkillClaims(
                userId,
                request.getResumeVerificationId(),
                request.getSkills()
        );
        return ResponseEntity.ok(upserted);
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimDTO>> getSkillClaims() {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(claimIngestionService.getSkillClaims(userId));
    }

    @PostMapping("/claims")
    public ResponseEntity<ClaimDTO> addSkillClaim(
            @RequestBody AddSkillClaimRequestDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        ClaimDTO claim = claimIngestionService.addSkillClaim(
                userId,
                request.getResumeVerificationId(),
                request.getSkill()
        );
        return ResponseEntity.ok(claim);
    }

    @DeleteMapping("/claims/{claimId}")
    public ResponseEntity<Void> deleteSkillClaim(@PathVariable UUID claimId) {
        UUID userId = resolveAuthenticatedUserId();
        claimIngestionService.deleteSkillClaim(userId, claimId);
        return ResponseEntity.noContent().build();
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
