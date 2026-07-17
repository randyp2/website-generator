package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Orchestrates resumable cleanup for an authenticated account owner.
 */
@Service
@RequiredArgsConstructor
public class AccountDeletionService {

    private static final String REQUIRED_CONFIRMATION = "DELETE";

    private final AccountDeletionStateService accountDeletionStateService;
    private final StripeAccountDeletionService stripeAccountDeletionService;
    private final AccountObjectStorageDeletionService accountObjectStorageDeletionService;
    private final AccountApplicationDataDeletionService accountApplicationDataDeletionService;
    private final AccountAuthDeletionService accountAuthDeletionService;

    /**
     * Starts or resumes account deletion for the authenticated profile id.
     *
     * @param profileId authenticated Supabase user id
     * @param request explicit destructive-action confirmation
     * @return the latest durable deletion stage
     */
    public AccountDeletionProgressDTO beginAccountDeletion(
            UUID profileId,
            DeleteAccountRequestDTO request
    ) {
        requireValidRequest(profileId, request);

        AccountDeletionStateService.DeletionContext context =
                accountDeletionStateService.begin(profileId);
        AccountDeletionStage stage = context.stage();

        if (!stage.isStripeCleanupComplete()) {
            stripeAccountDeletionService.deleteCustomer(context.stripeCustomerId());
            stage = accountDeletionStateService.markStripeCustomerDeleted(profileId);
        }

        if (!stage.isObjectStorageCleanupComplete()) {
            accountObjectStorageDeletionService.deleteForAccount(profileId);
            stage = accountDeletionStateService.markObjectStorageDeleted(profileId);
        }

        if (!stage.isApplicationDataCleanupComplete()) {
            accountApplicationDataDeletionService.deleteForAccount(profileId);
            stage = accountDeletionStateService.markApplicationDataDeleted(profileId);
        }

        if (!stage.isAccountDeletionComplete()) {
            stage = accountAuthDeletionService.deleteForAccount(profileId);
        }

        return AccountDeletionProgressDTO.builder()
                .stage(stage)
                .accountDeleted(stage.isAccountDeletionComplete())
                .build();
    }

    private void requireValidRequest(UUID profileId, DeleteAccountRequestDTO request) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        if (request == null || !REQUIRED_CONFIRMATION.equals(request.getConfirmation())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type DELETE to confirm account deletion"
            );
        }
    }
}
