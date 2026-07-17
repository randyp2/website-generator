package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingPromotionEligibility;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BillingPromotionEligibilityRepository
        extends JpaRepository<BillingPromotionEligibility, UUID> {

    /**
     * Locks an eligibility row so one campaign email can be claimed atomically.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT eligibility
        FROM BillingPromotionEligibility eligibility
        WHERE eligibility.campaignKey = :campaignKey
          AND eligibility.normalizedEmail = :normalizedEmail
    """)
    Optional<BillingPromotionEligibility> findForClaim(
            @Param("campaignKey") String campaignKey,
            @Param("normalizedEmail") String normalizedEmail
    );

    boolean existsByCampaignKeyAndClaimedProfile_Id(String campaignKey, UUID profileId);
}
