package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.integration.SupabaseAuthAdminClient;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Completes an account deletion after application data has been removed.
 */
@Service
@RequiredArgsConstructor
public class AccountAuthDeletionService {

    private final SupabaseAuthAdminClient supabaseAuthAdminClient;
    private final AccountDeletionStateService accountDeletionStateService;

    /** Permanently deletes the Auth user and records durable completion. */
    public AccountDeletionStage deleteForAccount(UUID profileId) {
        supabaseAuthAdminClient.deleteUser(profileId);
        return accountDeletionStateService.markCompleted(profileId);
    }
}
