package com.webgen.webgen_backend.account.service.impl;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import com.webgen.webgen_backend.account.service.AccountDeletionService;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.account.service.StripeAccountDeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountDeletionServiceImpl implements AccountDeletionService {

    private static final String REQUIRED_CONFIRMATION = "DELETE";

    private final AccountDeletionStateService accountDeletionStateService;
    private final StripeAccountDeletionService stripeAccountDeletionService;

    @Override
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

        return AccountDeletionProgressDTO.builder()
                .stage(stage)
                .accountDeleted(false)
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
