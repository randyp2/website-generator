package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.profile.dto.ProfileMeDTO;
import com.webgen.webgen_backend.profile.dto.UpdateProfileRequestDTO;
import com.webgen.webgen_backend.profile.dto.UsernameAvailabilityResponseDTO;
import com.webgen.webgen_backend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileMeDTO> getMyProfile() {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(profileService.getOrCreateMyProfile(profileId));
    }

    @PatchMapping("/me")
    public ResponseEntity<ProfileMeDTO> updateMyProfile(
            @RequestBody UpdateProfileRequestDTO request
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(profileService.updateMyProfile(profileId, request));
    }

    @GetMapping("/username-available")
    public ResponseEntity<UsernameAvailabilityResponseDTO> checkUsernameAvailability(
            @RequestParam String username
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(
                profileService.checkUsernameAvailability(username, profileId)
        );
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
