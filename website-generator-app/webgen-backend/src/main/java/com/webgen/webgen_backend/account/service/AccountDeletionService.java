package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;

import java.util.UUID;

/**
 * Orchestrates resumable cleanup for an authenticated account owner.
 */
public interface AccountDeletionService {

    /**
     * Starts or resumes account deletion for the authenticated profile id.
     *
     * @param profileId authenticated Supabase user id
     * @param request explicit destructive-action confirmation
     * @return the latest durable deletion stage
     */
    AccountDeletionProgressDTO beginAccountDeletion(
            UUID profileId,
            DeleteAccountRequestDTO request
    );
}
