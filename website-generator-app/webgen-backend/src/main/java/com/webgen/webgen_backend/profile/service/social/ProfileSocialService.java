package com.webgen.webgen_backend.profile.service.social;

import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;

import java.util.UUID;

public interface ProfileSocialService {
    ProfileSocialSummaryDTO getSummaryByUsername(String username, UUID viewerId);
    ProfileSocialSummaryDTO getSummaryByProfileId(UUID profileId, UUID viewerId);
    ProfileSocialSummaryDTO followProfile(UUID followerProfileId, UUID followedProfileId);
    ProfileSocialSummaryDTO unfollowProfile(UUID followerProfileId, UUID followedProfileId);
    ProfileSocialSummaryDTO recordProfileView(String username);
}
