package com.webgen.webgen_backend.profile.service.social;

import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;
import com.webgen.webgen_backend.profile.dto.social.ProfileSocialUserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProfileSocialService {
    ProfileSocialSummaryDTO getSummaryByUsername(String username, UUID viewerId);
    ProfileSocialSummaryDTO getSummaryByProfileId(UUID profileId, UUID viewerId);
    Page<ProfileSocialUserDTO> listFollowersByUsername(String username, Pageable pageable);
    Page<ProfileSocialUserDTO> listFollowingByUsername(String username, Pageable pageable);
    ProfileSocialSummaryDTO followProfile(UUID followerProfileId, UUID followedProfileId);
    ProfileSocialSummaryDTO unfollowProfile(UUID followerProfileId, UUID followedProfileId);
    ProfileSocialSummaryDTO recordProfileView(String username, UUID viewerId);
}
