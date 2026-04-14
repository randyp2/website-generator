package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, UUID> {
    List<ConnectedAccount> findByProfileIdOrderByCreatedAtDesc(UUID profileId);
}
