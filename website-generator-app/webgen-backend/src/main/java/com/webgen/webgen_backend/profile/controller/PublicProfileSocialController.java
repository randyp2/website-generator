package com.webgen.webgen_backend.profile.controller;

import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;
import com.webgen.webgen_backend.profile.dto.social.ProfileSocialUserDTO;
import com.webgen.webgen_backend.profile.service.social.ProfileSocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import com.webgen.webgen_backend.shared.ratelimit.ClientIp;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/profile/{username}/social")
@RequiredArgsConstructor
public class PublicProfileSocialController {

    private final ProfileSocialService profileSocialService;
    private final RateLimiterService rateLimiterService;

    @GetMapping
    public ResponseEntity<ProfileSocialSummaryDTO> getSummary(
            @PathVariable String username) {
        return ResponseEntity.ok(profileSocialService.getSummaryByUsername(username, resolveViewerId()));
    }

    @GetMapping("/followers")
    public ResponseEntity<Page<ProfileSocialUserDTO>> listFollowers(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return ResponseEntity.ok(profileSocialService.listFollowersByUsername(
                username,
                createSocialListPageRequest(page, size)));
    }

    @GetMapping("/following")
    public ResponseEntity<Page<ProfileSocialUserDTO>> listFollowing(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return ResponseEntity.ok(profileSocialService.listFollowingByUsername(
                username,
                createSocialListPageRequest(page, size)));
    }

    @PostMapping("/views")
    public ResponseEntity<ProfileSocialSummaryDTO> recordView(
            @PathVariable String username, HttpServletRequest httpRequest) {
        rateLimiterService.check("public-engagement", ClientIp.key(httpRequest));
        return ResponseEntity.ok(profileSocialService.recordProfileView(username, resolveViewerId()));
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

    private PageRequest createSocialListPageRequest(int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 50);
        return PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
