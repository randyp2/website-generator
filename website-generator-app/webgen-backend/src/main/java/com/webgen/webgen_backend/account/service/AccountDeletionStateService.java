package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.entity.AccountDeletionRequest;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import com.webgen.webgen_backend.account.repository.AccountDeletionRequestRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.function.Predicate;

/**
 * Owns durable account deletion state and guards operations that can create billing state.
 */
@Service
@RequiredArgsConstructor
public class AccountDeletionStateService {

    private final AccountDeletionRequestRepository accountDeletionRequestRepository;
    private final ProfileRepository profileRepository;

    /**
     * Starts deletion while serializing against billing operations that lock the same profile row.
     */
    @Transactional
    public DeletionContext begin(UUID profileId) {
        Profile profile = profileRepository.findByIdForUpdate(profileId).orElse(null);
        accountDeletionRequestRepository.insertIfAbsent(profileId);

        AccountDeletionRequest request = accountDeletionRequestRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Unable to persist account deletion request"
                ));

        String stripeCustomerId = profile != null ? profile.getStripeCustomerId() : null;
        return new DeletionContext(request.getStage(), stripeCustomerId);
    }

    /**
     * Rejects creation of new billing state after account deletion has started.
     */
    @Transactional(readOnly = true)
    public void assertAccountActive(UUID profileId) {
        if (accountDeletionRequestRepository.existsById(profileId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Account deletion is already in progress"
            );
        }
    }

    /**
     * Records successful Stripe cleanup so retries skip that external side effect.
     */
    @Transactional
    public AccountDeletionStage markStripeCustomerDeleted(UUID profileId) {
        int updatedRows = accountDeletionRequestRepository.markStripeCustomerDeleted(profileId);
        if (updatedRows == 1) {
            return AccountDeletionStage.STRIPE_CUSTOMER_DELETED;
        }
        return currentCompletedStage(
                profileId,
                AccountDeletionStage::isStripeCleanupComplete,
                "Unable to update account deletion progress"
        );
    }

    /**
     * Records completion only after every configured object storage provider succeeds.
     */
    @Transactional
    public AccountDeletionStage markObjectStorageDeleted(UUID profileId) {
        int updatedRows = accountDeletionRequestRepository.markObjectStorageDeleted(profileId);
        if (updatedRows == 1) {
            return AccountDeletionStage.OBJECT_STORAGE_DELETED;
        }
        return currentCompletedStage(
                profileId,
                AccountDeletionStage::isObjectStorageCleanupComplete,
                "Unable to update object storage deletion progress"
        );
    }

    /** Records that the profile cascade committed successfully. */
    @Transactional
    public AccountDeletionStage markApplicationDataDeleted(UUID profileId) {
        int updatedRows = accountDeletionRequestRepository
                .markApplicationDataDeleted(profileId);
        if (updatedRows == 1) {
            return AccountDeletionStage.APPLICATION_DATA_DELETED;
        }
        return currentCompletedStage(
                profileId,
                AccountDeletionStage::isApplicationDataCleanupComplete,
                "Unable to update application data deletion progress"
        );
    }

    /** Records that the Auth user is gone and the workflow is complete. */
    @Transactional
    public AccountDeletionStage markCompleted(UUID profileId) {
        int updatedRows = accountDeletionRequestRepository.markCompleted(profileId);
        if (updatedRows == 1) {
            return AccountDeletionStage.COMPLETED;
        }
        return currentCompletedStage(
                profileId,
                AccountDeletionStage::isAccountDeletionComplete,
                "Unable to complete account deletion"
        );
    }

    /** Returns accounts that only need idempotent Auth deletion retried. */
    @Transactional(readOnly = true)
    public List<UUID> findPendingAuthDeletionProfileIds() {
        return accountDeletionRequestRepository
                .findTop100ByStageOrderByUpdatedAtAsc(
                        AccountDeletionStage.APPLICATION_DATA_DELETED
                )
                .stream()
                .map(AccountDeletionRequest::getProfileId)
                .toList();
    }

    /**
     * Returns whether deletion has started without throwing at worker boundaries.
     */
    @Transactional(readOnly = true)
    public boolean hasDeletionStarted(UUID profileId) {
        return profileId != null && accountDeletionRequestRepository.existsById(profileId);
    }

    private AccountDeletionStage currentCompletedStage(
            UUID profileId,
            Predicate<AccountDeletionStage> isComplete,
            String failureMessage
    ) {
        return accountDeletionRequestRepository.findById(profileId)
                .map(AccountDeletionRequest::getStage)
                .filter(isComplete)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        failureMessage
                ));
    }

    /**
     * Snapshot captured while deletion intent is persisted under the profile lock.
     */
    public record DeletionContext(
            AccountDeletionStage stage,
            String stripeCustomerId
    ) {
    }
}
