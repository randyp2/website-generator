package com.webgen.webgen_backend.profile.service.social;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.profile.dto.social.ProfileSocialSummaryDTO;
import com.webgen.webgen_backend.profile.dto.social.ProfileSocialUserDTO;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.entity.ProfileFollow;
import com.webgen.webgen_backend.profile.entity.ProfileSocialCounter;
import com.webgen.webgen_backend.profile.repository.ProfileFollowRepository;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.profile.repository.ProfileSocialCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileSocialServiceImpl implements ProfileSocialService {

    private final ProfileRepository profileRepository;
    private final ProfileFollowRepository profileFollowRepository;
    private final ProfileSocialCounterRepository counterRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public ProfileSocialSummaryDTO getSummaryByUsername(String username, UUID viewerId) {
        Profile profile = findProfileByUsername(username);
        return toSummary(profile, viewerId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileSocialSummaryDTO getSummaryByProfileId(UUID profileId, UUID viewerId) {
        Profile profile = findProfile(profileId);
        return toSummary(profile, viewerId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfileSocialUserDTO> listFollowersByUsername(String username, Pageable pageable) {
        Profile profile = findProfileByUsername(username);
        return profileFollowRepository.findByFollowedProfile_Id(profile.getId(), pageable)
                .map(follow -> toSocialUserDto(follow.getFollowerProfile(), follow));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfileSocialUserDTO> listFollowingByUsername(String username, Pageable pageable) {
        Profile profile = findProfileByUsername(username);
        return profileFollowRepository.findByFollowerProfile_Id(profile.getId(), pageable)
                .map(follow -> toSocialUserDto(follow.getFollowedProfile(), follow));
    }

    @Override
    @Transactional
    public ProfileSocialSummaryDTO followProfile(UUID followerProfileId, UUID followedProfileId) {
        if (followerProfileId.equals(followedProfileId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow your own profile");
        }

        getOrCreateProfile(followerProfileId);
        Profile followedProfile = findProfile(followedProfileId);
        int inserted = profileFollowRepository.insertIgnore(UUID.randomUUID(), followerProfileId, followedProfileId);
        if (inserted == 1) {
            notifyProfileFollowed(followedProfile, followerProfileId);
        }
        return toSummary(followedProfile, followerProfileId);
    }

    @Override
    @Transactional
    public ProfileSocialSummaryDTO unfollowProfile(UUID followerProfileId, UUID followedProfileId) {
        if (followerProfileId.equals(followedProfileId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot unfollow your own profile");
        }

        Profile followedProfile = findProfile(followedProfileId);
        profileFollowRepository.deleteByFollowerProfileIdAndFollowedProfileId(
                followerProfileId,
                followedProfileId);
        return toSummary(followedProfile, followerProfileId);
    }

    @Override
    @Transactional
    public ProfileSocialSummaryDTO recordProfileView(String username, UUID viewerId) {
        Profile profile = findProfileByUsername(username);
        ensureCounter(profile);
        counterRepository.incrementProfileViewsCount(profile.getId());
        return toSummary(profile, viewerId);
    }

    private Profile findProfile(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private Profile findProfileByUsername(String username) {
        String normalizedUsername = normalizeUsername(username);
        if (normalizedUsername == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        return profileRepository.findByUsernameIgnoreCase(normalizedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    private Profile getOrCreateProfile(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setId(profileId);
                    profile.setOnboardingComplete(false);
                    return profileRepository.save(profile);
                });
    }

    private ProfileSocialCounter ensureCounter(Profile profile) {
        return counterRepository.findById(profile.getId()).orElseGet(() ->
                counterRepository.save(ProfileSocialCounter.builder()
                        .profile(profile)
                        .profileId(profile.getId())
                        .followersCount(0)
                        .followingCount(0)
                        .profileViewsCount(0)
                        .portfolioLikesCount(0)
                        .updatedAt(OffsetDateTime.now())
                        .build()));
    }

    private ProfileSocialSummaryDTO toSummary(Profile profile, UUID viewerId) {
        ProfileSocialCounter counter = counterRepository.findById(profile.getId()).orElse(null);
        return ProfileSocialSummaryDTO.builder()
                .profileId(profile.getId())
                .username(profile.getUsername())
                .followersCount(counter == null ? 0 : counter.getFollowersCount())
                .followingCount(counter == null ? 0 : counter.getFollowingCount())
                .profileViewsCount(counter == null ? 0 : counter.getProfileViewsCount())
                .portfolioLikesCount(counter == null ? 0 : counter.getPortfolioLikesCount())
                .viewerIsFollowing(viewerId != null
                        && !viewerId.equals(profile.getId())
                        && profileFollowRepository.existsByFollowerProfile_IdAndFollowedProfile_Id(
                                viewerId,
                                profile.getId()))
                .build();
    }

    private void notifyProfileFollowed(Profile followedProfile, UUID followerProfileId) {
        notificationService.createNotification(
                followedProfile.getId(),
                followerProfileId,
                NotificationService.TYPE_PROFILE_FOLLOWED,
                null,
                null,
                "profile_follow:" + followedProfile.getId() + ":" + followerProfileId,
                objectMapper.createObjectNode());
    }

    private ProfileSocialUserDTO toSocialUserDto(Profile profile, ProfileFollow follow) {
        return ProfileSocialUserDTO.builder()
                .profileId(profile.getId())
                .username(profile.getUsername())
                .fullName(profile.getFullName())
                .avatarUrl(profile.getAvatarUrl())
                .jobTitle(profile.getJobTitle())
                .company(profile.getCompany())
                .location(profile.getLocation())
                .followedAt(follow.getCreatedAt())
                .build();
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            return null;
        }

        String normalized = username.trim().toLowerCase(Locale.ROOT);
        return normalized.isBlank() ? null : normalized;
    }
}
