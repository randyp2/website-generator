package com.webgen.webgen_backend.account.repository;

import com.webgen.webgen_backend.account.entity.AccountDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AccountDeletionRequestRepository
        extends JpaRepository<AccountDeletionRequest, UUID> {

    @Modifying
    @Query(value = """
            INSERT INTO public.account_deletion_requests (
                profile_id,
                stage,
                created_at,
                updated_at
            ) VALUES (
                :profileId,
                'REQUESTED',
                now(),
                now()
            )
            ON CONFLICT (profile_id) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("profileId") UUID profileId);

    @Modifying
    @Query(value = """
            UPDATE public.account_deletion_requests
            SET stage = 'STRIPE_CUSTOMER_DELETED',
                stripe_customer_deleted_at = COALESCE(stripe_customer_deleted_at, now()),
                updated_at = now()
            WHERE profile_id = :profileId
            """, nativeQuery = true)
    int markStripeCustomerDeleted(@Param("profileId") UUID profileId);
}
