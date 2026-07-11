package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.AssetVerificationJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AssetVerificationJobRepository extends JpaRepository<AssetVerificationJob, UUID> {
    List<AssetVerificationJob> findByStatusInAndUpdatedAtBefore(List<String> statuses, OffsetDateTime cutoff);
}
