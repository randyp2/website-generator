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

import java.util.UUID;

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
        if (updatedRows != 1) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to update account deletion progress"
            );
        }
        return AccountDeletionStage.STRIPE_CUSTOMER_DELETED;
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
