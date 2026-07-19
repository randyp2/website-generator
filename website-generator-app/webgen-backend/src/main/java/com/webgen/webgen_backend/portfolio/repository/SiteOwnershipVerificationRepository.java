package com.webgen.webgen_backend.portfolio.repository;

import com.webgen.webgen_backend.portfolio.entity.SiteOwnershipVerification;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Persistence access for user-scoped external website verification challenges.
 */
public interface SiteOwnershipVerificationRepository
        extends JpaRepository<SiteOwnershipVerification, UUID> {

    Optional<SiteOwnershipVerification> findByIdAndUserId(UUID id, UUID userId);

    /** Returns only IDs needed to derive account-owned preview storage prefixes. */
    @Query("SELECT verification.id FROM SiteOwnershipVerification verification WHERE verification.userId = :userId")
    List<UUID> findIdsByUserId(@Param("userId") UUID userId);

    Optional<SiteOwnershipVerification> findByUserIdAndVerificationUrlAndMethod(
            UUID userId,
            String verificationUrl,
            SiteVerificationMethod method
    );
}
