package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.verification.dto.AddSkillClaimRequestDTO;
import com.webgen.webgen_backend.verification.dto.ClaimDTO;
import com.webgen.webgen_backend.verification.dto.IngestSkillClaimsRequestDTO;
import com.webgen.webgen_backend.verification.service.ClaimIngestionService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/resume-verification/claims")
@RequiredArgsConstructor
public class ProfileClaimController {

    private final ClaimIngestionService claimIngestionService;

    @GetMapping
    public ResponseEntity<List<ClaimDTO>> getSkillClaims() {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(claimIngestionService.getSkillClaims(userId));
    }

    @PostMapping
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

    @PostMapping("/ingest")
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

    @DeleteMapping("/{claimId}")
    public ResponseEntity<Void> deleteSkillClaim(@PathVariable UUID claimId) {
        UUID userId = resolveAuthenticatedUserId();
        claimIngestionService.deleteSkillClaim(userId, claimId);
        return ResponseEntity.noContent().build();
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
