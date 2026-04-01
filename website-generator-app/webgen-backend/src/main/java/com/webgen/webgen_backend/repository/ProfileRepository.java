package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
}
