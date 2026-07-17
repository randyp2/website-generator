package com.webgen.webgen_backend.account.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Recovers the narrow state where application data is gone but Auth is not confirmed deleted.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountAuthDeletionRecoveryService {

    private final AccountDeletionStateService accountDeletionStateService;
    private final AccountAuthDeletionService accountAuthDeletionService;

    /** Retries a bounded batch of idempotent Supabase Auth deletions. */
    @Scheduled(fixedDelayString = "${account.deletion.auth-recovery-ms:60000}")
    public void recoverPendingAuthDeletions() {
        for (UUID profileId : accountDeletionStateService
                .findPendingAuthDeletionProfileIds()) {
            try {
                accountAuthDeletionService.deleteForAccount(profileId);
            } catch (RuntimeException exception) {
                log.warn(
                        "Account Auth deletion recovery failed profileId={} reason={}",
                        profileId,
                        exception.getMessage()
                );
            }
        }
    }
}
