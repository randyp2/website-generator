package com.webgen.webgen_backend.profile.service.impl;

import com.webgen.webgen_backend.profile.dto.ProfileMeDTO;
import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.dto.UpdateProfileRequestDTO;
import com.webgen.webgen_backend.profile.dto.UsernameAvailabilityResponseDTO;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.mapper.ProfileMapper;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$");

    private static final int MAX_BIO_LENGTH = 500;

    private static final Set<String> RESERVED_USERNAMES = Set.of(
            "api",
            "auth",
            "dashboard-user",
            "error",
            "explore",
            "how-it-works",
            "logout",
            "onboarding",
            "portfolio"
    );

    @Override
    @Transactional
    public ProfileMeDTO getOrCreateMyProfile(UUID profileId) {
        Profile profile = getOrCreateProfile(profileId);
        profile = syncOnboardingComplete(profile);
        return profileMapper.toMeDto(profile);
    }

    @Override
    @Transactional
    public ProfileMeDTO updateMyProfile(UUID profileId, UpdateProfileRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        Profile profile = getOrCreateProfile(profileId);

        if (request.getUsername() != null) {
            String normalizedUsername = normalizeUsernameForMutation(request.getUsername());
            ensureUsernameAvailabilityForProfile(normalizedUsername, profileId);
            profile.setUsername(normalizedUsername);
        }
        if (request.getFullName() != null) profile.setFullName(normalizeOptionalText(request.getFullName()));
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(normalizeOptionalText(request.getAvatarUrl()));
        if (request.getBio() != null) profile.setBio(normalizeBio(request.getBio()));
        if (request.getBannerUrl() != null) profile.setBannerUrl(normalizeOptionalText(request.getBannerUrl()));
        if (request.getLocation() != null) profile.setLocation(normalizeOptionalText(request.getLocation()));
        if (request.getSchool() != null) profile.setSchool(normalizeOptionalText(request.getSchool()));
        if (request.getDegree() != null) profile.setDegree(normalizeOptionalText(request.getDegree()));
        if (request.getJobTitle() != null) profile.setJobTitle(normalizeOptionalText(request.getJobTitle()));
        if (request.getCompany() != null) profile.setCompany(normalizeOptionalText(request.getCompany()));
        if (request.getWebsiteUrl() != null) profile.setWebsiteUrl(normalizeOptionalText(request.getWebsiteUrl()));
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(normalizeOptionalText(request.getLinkedinUrl()));
        if (request.getGithubUrl() != null) profile.setGithubUrl(normalizeOptionalText(request.getGithubUrl()));
        profile.setOnboardingComplete(deriveOnboardingComplete(profile));

        try {
            Profile saved = profileRepository.save(profile);
            return profileMapper.toMeDto(saved);
        } catch (DataIntegrityViolationException exception) {
            throw mapDataIntegrityViolation(exception);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PublicProfileDTO> getPublicProfileByUsername(String username) {
        String normalizedUsername = normalizeUsernameForLookup(username);
        if (normalizedUsername == null) {
            return Optional.empty();
        }

        return profileRepository.findByUsernameIgnoreCase(normalizedUsername)
                .map(profileMapper::toPublicDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UsernameAvailabilityResponseDTO checkUsernameAvailability(
            String username,
            UUID currentProfileId
    ) {
        String normalizedUsername = normalizeUsernameForAvailability(username);
        if (normalizedUsername == null) {
            return UsernameAvailabilityResponseDTO.builder()
                    .username(null)
                    .available(false)
                    .reason("invalid")
                    .build();
        }
        if (!USERNAME_PATTERN.matcher(normalizedUsername).matches()) {
            return UsernameAvailabilityResponseDTO.builder()
                    .username(normalizedUsername)
                    .available(false)
                    .reason("invalid")
                    .build();
        }

        if (isReservedUsername(normalizedUsername)) {
            return UsernameAvailabilityResponseDTO.builder()
                    .username(normalizedUsername)
                    .available(false)
                    .reason("reserved")
                    .build();
        }

        boolean exists = currentProfileId == null
                ? profileRepository.existsByUsernameIgnoreCase(normalizedUsername)
                : profileRepository.existsByUsernameIgnoreCaseAndIdNot(normalizedUsername, currentProfileId);

        return UsernameAvailabilityResponseDTO.builder()
                .username(normalizedUsername)
                .available(!exists)
                .reason(exists ? "taken" : "available")
                .build();
    }

    private Profile getOrCreateProfile(UUID profileId) {
        return profileRepository.findById(profileId)
                .map(existing -> {
                    if (existing.getOnboardingComplete() == null) {
                        existing.setOnboardingComplete(deriveOnboardingComplete(existing));
                        return profileRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setId(profileId);
                    profile.setOnboardingComplete(false);
                    return profileRepository.save(profile);
                });
    }

    private Profile syncOnboardingComplete(Profile profile) {
        boolean derivedOnboardingComplete = deriveOnboardingComplete(profile);
        if (!Objects.equals(profile.getOnboardingComplete(), derivedOnboardingComplete)) {
            profile.setOnboardingComplete(derivedOnboardingComplete);
            return profileRepository.save(profile);
        }
        return profile;
    }

    private void ensureUsernameAvailabilityForProfile(String username, UUID profileId) {
        boolean taken = profileRepository.existsByUsernameIgnoreCaseAndIdNot(username, profileId);
        if (taken) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
    }

    private String normalizeUsernameForMutation(String username) {
        String normalizedUsername = normalizeUsernameForAvailability(username);
        if (normalizedUsername == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (isReservedUsername(normalizedUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is reserved");
        }
        if (!USERNAME_PATTERN.matcher(normalizedUsername).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid username format");
        }

        return normalizedUsername;
    }

    private String normalizeUsernameForLookup(String username) {
        String normalizedUsername = normalizeUsernameForAvailability(username);
        if (normalizedUsername == null) {
            return null;
        }
        if (!USERNAME_PATTERN.matcher(normalizedUsername).matches()) {
            return null;
        }
        if (isReservedUsername(normalizedUsername)) {
            return null;
        }

        return normalizedUsername;
    }

    private String normalizeUsernameForAvailability(String username) {
        if (username == null) {
            return null;
        }

        String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);
        if (normalizedUsername.isBlank()) {
            return null;
        }

        return normalizedUsername;
    }

    private boolean isReservedUsername(String username) {
        return RESERVED_USERNAMES.contains(username);
    }

    private boolean deriveOnboardingComplete(Profile profile) {
        String normalizedUsername = normalizeUsernameForAvailability(profile.getUsername());
        return normalizedUsername != null
                && USERNAME_PATTERN.matcher(normalizedUsername).matches()
                && !isReservedUsername(normalizedUsername);
    }

    private String normalizeBio(String bio) {
        String normalizedBio = normalizeOptionalText(bio);
        if (normalizedBio == null) {
            return null;
        }
        if (normalizedBio.length() > MAX_BIO_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bio must be at most " + MAX_BIO_LENGTH + " characters"
            );
        }
        return normalizedBio;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ResponseStatusException mapDataIntegrityViolation(DataIntegrityViolationException exception) {
        String message = exception.getMostSpecificCause() != null
                ? exception.getMostSpecificCause().getMessage()
                : "";
        if (message != null && message.contains("profiles_username_lower_key")) {
            return new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile data");
    }

}
