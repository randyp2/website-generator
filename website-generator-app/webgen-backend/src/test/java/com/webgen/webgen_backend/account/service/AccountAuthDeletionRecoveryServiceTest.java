package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AccountAuthDeletionRecoveryServiceTest {

    @Test
    void continuesRecoveryAfterOneAccountFails() {
        UUID failingProfileId = UUID.randomUUID();
        UUID successfulProfileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                List.of(failingProfileId, successfulProfileId)
        );
        RecordingAuthDeletionService authService =
                new RecordingAuthDeletionService(failingProfileId);
        AccountAuthDeletionRecoveryService recoveryService =
                new AccountAuthDeletionRecoveryService(stateService, authService);

        recoveryService.recoverPendingAuthDeletions();

        assertThat(authService.profileIds)
                .containsExactly(failingProfileId, successfulProfileId);
    }

    private static final class RecordingStateService
            extends AccountDeletionStateService {

        private final List<UUID> profileIds;

        private RecordingStateService(List<UUID> profileIds) {
            super(null, null);
            this.profileIds = profileIds;
        }

        @Override
        public List<UUID> findPendingAuthDeletionProfileIds() {
            return profileIds;
        }
    }

    private static final class RecordingAuthDeletionService
            extends AccountAuthDeletionService {

        private final UUID failingProfileId;
        private final List<UUID> profileIds = new ArrayList<>();

        private RecordingAuthDeletionService(UUID failingProfileId) {
            super(null, null);
            this.failingProfileId = failingProfileId;
        }

        @Override
        public AccountDeletionStage deleteForAccount(UUID profileId) {
            profileIds.add(profileId);
            if (failingProfileId.equals(profileId)) {
                throw new IllegalStateException("Supabase unavailable");
            }
            return AccountDeletionStage.COMPLETED;
        }
    }
}
