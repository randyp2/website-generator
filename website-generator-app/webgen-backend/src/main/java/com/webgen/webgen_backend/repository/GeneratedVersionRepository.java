package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.GeneratedVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GeneratedVersionRepository extends JpaRepository<GeneratedVersion, UUID> {}
