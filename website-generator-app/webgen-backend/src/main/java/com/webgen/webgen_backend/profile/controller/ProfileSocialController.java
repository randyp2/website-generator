package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;
import com.webgen.webgen_backend.profile.service.social.ProfileSocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/social")
@RequiredArgsConstructor
public class ProfileSocialController {

    private final ProfileSocialService profileSocialService;

    @GetMapping("/{profileId}")
    public ResponseEntity<ProfileSocialSummaryDTO> getSummary(
            @PathVariable UUID profileId) {
        UUID viewerId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(profileSocialService.getSummaryByProfileId(profileId, viewerId));
    }

    @PostMapping("/{profileId}/follow")
    public ResponseEntity<ProfileSocialSummaryDTO> followProfile(
            @PathVariable UUID profileId) {
        UUID viewerId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(profileSocialService.followProfile(viewerId, profileId));
    }

    @DeleteMapping("/{profileId}/follow")
    public ResponseEntity<ProfileSocialSummaryDTO> unfollowProfile(
            @PathVariable UUID profileId) {
        UUID viewerId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(profileSocialService.unfollowProfile(viewerId, profileId));
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
