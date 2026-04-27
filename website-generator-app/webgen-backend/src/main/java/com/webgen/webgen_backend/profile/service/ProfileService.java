package com.webgen.webgen_backend.profile.service;

import com.webgen.webgen_backend.profile.dto.ProfileMeDTO;
import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.dto.UpdateProfileRequestDTO;
import com.webgen.webgen_backend.profile.dto.UsernameAvailabilityResponseDTO;

import java.util.Optional;
import java.util.UUID;

public interface ProfileService {

    /**
     * Loads the authenticated user's profile and creates a minimal row when one does not exist.
     *
     * @param profileId authenticated profile id from JWT principal
     * @return profile payload for "me" surfaces
     */
    ProfileMeDTO getOrCreateMyProfile(UUID profileId);

    /**
     * Applies partial profile updates for the authenticated user.
     * Fields omitted in the request are left unchanged. Supplied fields are normalized and validated.
     *
     * @param profileId authenticated profile id from JWT principal
     * @param request incoming mutable profile fields
     * @return updated profile payload for "me" surfaces
     */
    ProfileMeDTO updateMyProfile(UUID profileId, UpdateProfileRequestDTO request);

    /**
     * Resolves a public profile by route username.
     *
     * @param username route handle candidate from request path
     * @return public profile if found and valid; empty otherwise
     */
    Optional<PublicProfileDTO> getPublicProfileByUsername(String username);

    /**
     * Checks whether a normalized username is available for use.
     *
     * @param username raw username candidate
     * @param currentProfileId optional current profile id to exclude from uniqueness checks
     * @return availability response containing normalized username and reason
     */
    UsernameAvailabilityResponseDTO checkUsernameAvailability(
            String username,
            UUID currentProfileId
    );
}
