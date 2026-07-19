package com.webgen.webgen_backend.profile.dto.social;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProfileSocialSummaryDTO {
    private UUID profileId;
    private String username;
    private int followersCount;
    private int followingCount;
    private int profileViewsCount;
    private int portfolioLikesCount;
    private boolean viewerIsFollowing;
}
