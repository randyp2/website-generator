package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClaimEvidenceUploadRepository extends JpaRepository<ClaimEvidenceUpload, UUID> {

    Optional<ClaimEvidenceUpload> findByProfileIdAndId(UUID profileId, UUID id);

    Optional<ClaimEvidenceUpload> findByProfileIdAndStorageProviderAndStorageBucketAndStorageKey(
            UUID profileId,
            String storageProvider,
            String storageBucket,
            String storageKey
    );

    List<ClaimEvidenceUpload> findByProfileIdAndClaimIdOrderByCreatedAtDesc(UUID profileId, UUID claimId);

    List<ClaimEvidenceUpload> findByProfileIdAndStatusOrderByCreatedAtAsc(UUID profileId, String status);
}

