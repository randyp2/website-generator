package com.webgen.webgen_backend.profile.repository;

import com.webgen.webgen_backend.profile.entity.Profile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUsernameIgnoreCase(String username);

    Optional<Profile> findByStripeCustomerId(String stripeCustomerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT profile FROM Profile profile WHERE profile.id = :profileId")
    Optional<Profile> findByIdForUpdate(@Param("profileId") UUID profileId);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, UUID id);
}
