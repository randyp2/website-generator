package com.webgen.webgen_backend.profile.repository;

import com.webgen.webgen_backend.profile.entity.ProfileSocialCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ProfileSocialCounterRepository
        extends JpaRepository<ProfileSocialCounter, UUID> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update ProfileSocialCounter c
            set c.profileViewsCount = c.profileViewsCount + 1
            where c.profileId = :profileId
            """)
    int incrementProfileViewsCount(UUID profileId);
}
