package com.webgen.webgen_backend.verification.controller;

import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadListResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.FinalizeClaimEvidenceUploadRequestDTO;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/resume-verification/claims/{claimId}/evidence-uploads")
@RequiredArgsConstructor
public class ProfileClaimEvidenceUploadController {

    private final ClaimEvidenceUploadService claimEvidenceUploadService;

    @PostMapping("/presign")
    public ResponseEntity<CreateClaimEvidenceUploadPresignResponseDTO> createUploadPresign(
            @PathVariable UUID claimId,
            @RequestBody CreateClaimEvidenceUploadPresignRequestDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        CreateClaimEvidenceUploadPresignResponseDTO response = claimEvidenceUploadService.createUploadPresign(
                userId,
                claimId,
                request
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/finalize")
    public ResponseEntity<ClaimEvidenceUploadDTO> finalizeUpload(
            @PathVariable UUID claimId,
            @RequestBody FinalizeClaimEvidenceUploadRequestDTO request
    ) {
        UUID userId = resolveAuthenticatedUserId();
        ClaimEvidenceUploadDTO response = claimEvidenceUploadService.finalizeUpload(
                userId,
                claimId,
                request
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ClaimEvidenceUploadListResponseDTO> listClaimUploads(
            @PathVariable UUID claimId
    ) {
        UUID userId = resolveAuthenticatedUserId();
        ClaimEvidenceUploadListResponseDTO response = claimEvidenceUploadService.listClaimUploads(
                userId,
                claimId
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{uploadId}")
    public ResponseEntity<Void> deleteUpload(
            @PathVariable UUID claimId,
            @PathVariable UUID uploadId
    ) {
        UUID userId = resolveAuthenticatedUserId();
        claimEvidenceUploadService.deleteUpload(
                userId,
                claimId,
                uploadId
        );
        return ResponseEntity.noContent().build();
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
