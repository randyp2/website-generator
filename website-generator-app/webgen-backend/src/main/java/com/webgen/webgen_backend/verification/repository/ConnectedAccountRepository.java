package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, UUID> {
    List<ConnectedAccount> findByProfileIdOrderByCreatedAtDesc(UUID profileId);

    Optional<ConnectedAccount> findByProfileIdAndProvider(UUID profileId, String provider);
}
