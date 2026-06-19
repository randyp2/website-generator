package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;
import com.webgen.webgen_backend.profile.service.social.ProfileSocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/profile/{username}/social")
@RequiredArgsConstructor
public class PublicProfileSocialController {

    private final ProfileSocialService profileSocialService;

    @GetMapping
    public ResponseEntity<ProfileSocialSummaryDTO> getSummary(
            @PathVariable String username) {
        return ResponseEntity.ok(profileSocialService.getSummaryByUsername(username, resolveViewerId()));
    }

    @PostMapping("/views")
    public ResponseEntity<ProfileSocialSummaryDTO> recordView(
            @PathVariable String username) {
        return ResponseEntity.ok(profileSocialService.recordProfileView(username));
    }

    private UUID resolveViewerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof String principal)) {
            return null;
        }

        try {
            return UUID.fromString(principal);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
