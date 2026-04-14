package com.webgen.webgen_backend.repository;

import com.webgen.webgen_backend.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClaimRepository extends JpaRepository<Claim, UUID> {
    List<Claim> findByProfileId(UUID profileId);

    /**
     * Returns only skill claims for the profile.
     */
    @Query("""
        SELECT c FROM Claim c
        WHERE c.profile.id = :profileId
            AND c.claimType = 'skill'
    """)
    List<Claim> findSkillClaimsByProfileId(UUID profileId);

    /**
     * Find existing skill claim fot this user
     *  - Case insensitive search by raw value
     *  - Used for the upsert to prevent duplicates
     */
    @Query("""
        SELECT c FROM Claim c 
        WHERE c.profile.id = :profileId
            AND c.claimType = 'skill'
            AND lower(c.rawValue) = lower(:rawValue)        
    """)
    Optional<Claim> findSkillClaimByProfileAndRawValue(UUID profileId, String rawValue);
}
