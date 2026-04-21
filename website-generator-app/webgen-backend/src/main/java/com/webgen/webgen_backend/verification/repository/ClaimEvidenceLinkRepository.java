package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClaimEvidenceLinkRepository extends JpaRepository<ClaimEvidenceLink, UUID> {

    Optional<ClaimEvidenceLink> findByProfileIdAndClaimIdAndEvidenceId(
            UUID profileId,
            UUID claimId,
            UUID evidenceId
    );

    List<ClaimEvidenceLink> findByProfileIdAndClaimId(UUID profileId, UUID claimId);

    List<ClaimEvidenceLink> findByProfileIdAndEvidenceId(UUID profileId, UUID evidenceId);

    List<ClaimEvidenceLink> findByProfileIdAndEvidenceIdIn(UUID profileId, List<UUID> evidenceIds);

    List<ClaimEvidenceLink> findByProfileIdAndClaimIdIn(UUID profileId, List<UUID> claimIds);

    void deleteByProfileIdAndClaimIdAndEvidenceId(UUID profileId, UUID claimId, UUID evidenceId);
}
