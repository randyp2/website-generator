package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    Optional<Resume> findByPortfolioId(UUID portfolioId);
}
