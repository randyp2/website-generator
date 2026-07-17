package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.storage.R2AccountStorageDeletionService;
import com.webgen.webgen_backend.account.storage.SupabaseAccountStorageDeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Coordinates every object storage provider before account data can be cascaded.
 */
@Service
@RequiredArgsConstructor
public class AccountObjectStorageDeletionService {

    private final R2AccountStorageDeletionService r2AccountStorageDeletionService;
    private final SupabaseAccountStorageDeletionService supabaseAccountStorageDeletionService;

    /**
     * Deletes account-owned objects from every configured provider.
     */
    public void deleteForAccount(UUID profileId) {
        r2AccountStorageDeletionService.deleteForAccount(profileId);
        supabaseAccountStorageDeletionService.deleteForAccount(profileId);
    }
}
