package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.dto.UsernameAvailabilityResponseDTO;
import com.webgen.webgen_backend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/profile")
@RequiredArgsConstructor
public class PublicProfileController {

    private final ProfileService profileService;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDTO> getByUsername(@PathVariable String username) {
        return profileService.getPublicProfileByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username-available")
    public ResponseEntity<UsernameAvailabilityResponseDTO> checkUsernameAvailability(
            @RequestParam(required = false) String username
    ) {
        return ResponseEntity.ok(
                profileService.checkUsernameAvailability(username, null)
        );
    }
}
