package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResumeVerificationRepository extends JpaRepository<ResumeVerification, UUID> {
    Optional<ResumeVerification> findByProfileId(UUID profileId);
}
