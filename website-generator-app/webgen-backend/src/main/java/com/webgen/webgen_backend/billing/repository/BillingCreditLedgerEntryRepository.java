package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingCreditLedgerEntryRepository extends JpaRepository<BillingCreditLedgerEntry, UUID> {

    List<BillingCreditLedgerEntry> findByProfileIdOrderByCreatedAtDesc(UUID profileId);

    boolean existsByStripeEventId(String stripeEventId);

    boolean existsByCheckoutSessionIdAndReason(String checkoutSessionId, String reason);

    Optional<BillingCreditLedgerEntry> findByCheckoutSessionId(String checkoutSessionId);

    boolean existsByCreditOperationIdAndReason(UUID creditOperationId, String reason);

    @Query("""
        SELECT COALESCE(SUM(e.deltaCredits), 0)
        FROM BillingCreditLedgerEntry e
        WHERE e.profile.id = :profileId
          AND e.creditBucket = :creditBucket
    """)
    Integer computeBalanceByProfileIdAndCreditBucket(
            @Param("profileId") UUID profileId,
            @Param("creditBucket") CreditBucket creditBucket
    );

    /**
     * Computes only unrestricted purchased and legacy credits.
     */
    default Integer computeBalanceByProfileId(UUID profileId) {
        return computeBalanceByProfileIdAndCreditBucket(profileId, CreditBucket.GENERAL);
    }

    /**
     * Locks active positive grants in expiration order for atomic allowance reservation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT e
        FROM BillingCreditLedgerEntry e
        WHERE e.profile.id = :profileId
          AND e.creditBucket = :creditBucket
          AND e.deltaCredits > 0
          AND e.grantKey IS NOT NULL
          AND (e.validFrom IS NULL OR e.validFrom <= :activeAt)
          AND (e.expiresAt IS NULL OR e.expiresAt > :activeAt)
        ORDER BY
          CASE WHEN e.expiresAt IS NULL THEN 1 ELSE 0 END,
          e.expiresAt,
          e.createdAt
    """)
    List<BillingCreditLedgerEntry> findActiveAllowanceGrantsForUpdate(
            @Param("profileId") UUID profileId,
            @Param("creditBucket") CreditBucket creditBucket,
            @Param("activeAt") OffsetDateTime activeAt
    );

    /**
     * Finds active grants without locking them for a read-only balance snapshot.
     */
    @Query("""
        SELECT e
        FROM BillingCreditLedgerEntry e
        WHERE e.profile.id = :profileId
          AND e.creditBucket = :creditBucket
          AND e.deltaCredits > 0
          AND e.grantKey IS NOT NULL
          AND (e.validFrom IS NULL OR e.validFrom <= :activeAt)
          AND (e.expiresAt IS NULL OR e.expiresAt > :activeAt)
        ORDER BY
          CASE WHEN e.expiresAt IS NULL THEN 1 ELSE 0 END,
          e.expiresAt,
          e.createdAt
    """)
    List<BillingCreditLedgerEntry> findActiveAllowanceGrants(
            @Param("profileId") UUID profileId,
            @Param("creditBucket") CreditBucket creditBucket,
            @Param("activeAt") OffsetDateTime activeAt
    );

    /**
     * Sums an allowance grant and every reservation or refund linked to it.
     */
    @Query("""
        SELECT COALESCE(SUM(e.deltaCredits), 0)
        FROM BillingCreditLedgerEntry e
        WHERE e.id = :grantEntryId
           OR e.grantEntry.id = :grantEntryId
    """)
    Integer computeRemainingUnitsByGrantEntryId(@Param("grantEntryId") UUID grantEntryId);

    /**
     * Computes the remaining units across all currently active grants in a bucket.
     */
    default int computeActiveAllowanceBalance(
            UUID profileId,
            CreditBucket creditBucket,
            OffsetDateTime activeAt
    ) {
        return findActiveAllowanceGrants(profileId, creditBucket, activeAt).stream()
                .mapToInt(grant -> Math.max(
                        0,
                        Optional.ofNullable(computeRemainingUnitsByGrantEntryId(grant.getId()))
                                .orElse(0)
                ))
                .sum();
    }

    Optional<BillingCreditLedgerEntry> findByGrantKey(String grantKey);
}
