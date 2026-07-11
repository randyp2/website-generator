package com.webgen.webgen_backend.verification.repository;

import com.webgen.webgen_backend.verification.entity.VerificationOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface VerificationOutboxRepository extends JpaRepository<VerificationOutboxEvent, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<VerificationOutboxEvent> findTop25ByStatusAndAvailableAtLessThanEqualOrderByCreatedAtAsc(
            String status, OffsetDateTime availableAt);
}
