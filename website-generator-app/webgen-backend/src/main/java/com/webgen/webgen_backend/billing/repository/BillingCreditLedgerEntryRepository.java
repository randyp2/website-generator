package com.webgen.webgen_backend.billing.repository;

import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingCreditLedgerEntryRepository extends JpaRepository<BillingCreditLedgerEntry, UUID> {

    List<BillingCreditLedgerEntry> findByProfileIdOrderByCreatedAtDesc(UUID profileId);

    boolean existsByStripeEventId(String stripeEventId);

    boolean existsByCheckoutSessionId(String checkoutSessionId);

    Optional<BillingCreditLedgerEntry> findByCheckoutSessionId(String checkoutSessionId);

    @Query("""
        SELECT COALESCE(SUM(e.deltaCredits), 0)
        FROM BillingCreditLedgerEntry e
        WHERE e.profile.id = :profileId
    """)
    Integer computeBalanceByProfileId(UUID profileId);
}
