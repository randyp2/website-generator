package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    // Idempotent upsert lookup key: scoped by profile + provider + external provider id.
    Optional<Evidence> findByProfileIdAndProviderAndExternalId(
            UUID profileId,
            String provider,
            String externalId
    );

    List<Evidence> findByProfileIdOrderByCapturedAtDesc(UUID profileId);

    List<Evidence> findByProfileIdAndProviderOrderByCapturedAtDesc(UUID profileId, String provider);

    List<Evidence> findByProfileIdAndProvider(UUID profileId, String provider);

    Optional<Evidence> findByProfileIdAndSourceUploadId(UUID profileId, UUID sourceUploadId);
}
