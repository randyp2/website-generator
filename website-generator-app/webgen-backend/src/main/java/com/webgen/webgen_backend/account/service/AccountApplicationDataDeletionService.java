package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

/**
 * Deletes application database data after all external object cleanup succeeds.
 */
@Service
@RequiredArgsConstructor
public class AccountApplicationDataDeletionService {

    private final ProfileRepository profileRepository;
    private final EntityManager entityManager;

    /**
     * Deletes the profile in one transaction and relies on audited database cascades.
     * Repeated calls succeed after the profile is already gone.
     */
    @Transactional
    public void deleteForAccount(UUID profileId) {
        if (profileId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "profileId is required");
        }

        Profile profile = profileRepository.findByIdForUpdate(profileId).orElse(null);
        if (profile == null) {
            return;
        }

        deleteLegacyEmailVerification(profile.getEmail());
        profileRepository.delete(profile);
        profileRepository.flush();
    }

    private void deleteLegacyEmailVerification(String email) {
        if (!StringUtils.hasText(email)) {
            return;
        }
        entityManager.createNativeQuery("""
                DELETE FROM public.email_verifications
                WHERE lower(email) = lower(:email)
                """)
                .setParameter("email", email.trim())
                .executeUpdate();
    }
}
