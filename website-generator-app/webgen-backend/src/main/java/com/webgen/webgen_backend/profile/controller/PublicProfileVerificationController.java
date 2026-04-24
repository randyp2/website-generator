package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.verification.dto.pub.PublicClaimDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceListResponseDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationSummaryDTO;
import com.webgen.webgen_backend.verification.service.pub.PublicVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/profile")
@RequiredArgsConstructor
public class PublicProfileVerificationController {

    private final PublicVerificationService publicVerificationService;

    @GetMapping("/{username}/verification/summary")
    public ResponseEntity<PublicVerificationSummaryDTO> getSummaryByUsername(
            @PathVariable String username
    ) {
        return publicVerificationService.getSummaryByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/verification/claims")
    public ResponseEntity<List<PublicClaimDTO>> getClaimsByUsername(
            @PathVariable String username
    ) {
        return publicVerificationService.getClaimsByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/verification/connections")
    public ResponseEntity<List<PublicConnectedAccountDTO>> getConnectionsByUsername(
            @PathVariable String username
    ) {
        return publicVerificationService.getConnectionsByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/verification/evidence")
    public ResponseEntity<PublicEvidenceListResponseDTO> getEvidenceByUsername(
            @PathVariable String username,
            @RequestParam(required = false) String provider
    ) {
        return publicVerificationService.getEvidenceByUsername(username, provider)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
