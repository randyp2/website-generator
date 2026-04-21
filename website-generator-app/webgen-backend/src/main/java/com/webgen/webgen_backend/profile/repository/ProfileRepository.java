package com.webgen.webgen_backend.profile.repository;

import com.webgen.webgen_backend.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
}
