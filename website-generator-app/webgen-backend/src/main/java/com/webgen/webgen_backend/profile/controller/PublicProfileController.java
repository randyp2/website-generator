package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioCardDTO;
import com.webgen.webgen_backend.portfolio.service.pub.PublicPortfolioService;
import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.dto.UsernameAvailabilityResponseDTO;
import com.webgen.webgen_backend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    private final PublicPortfolioService publicPortfolioService;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDTO> getByUsername(@PathVariable String username) {
        return profileService.getPublicProfileByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/portfolios")
    public ResponseEntity<Page<PublicPortfolioCardDTO>> getPortfoliosByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        size = Math.min(size, 50);
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "updatedAt")
        );

        return profileService.getPublicProfileByUsername(username)
                .map(profile -> ResponseEntity.ok(
                        publicPortfolioService.listPublishedByUserId(profile.getId(), pageRequest)
                ))
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
