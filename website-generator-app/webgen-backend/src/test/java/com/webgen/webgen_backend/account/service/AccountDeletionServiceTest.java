package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountDeletionServiceTest {

    @Test
    void completesEveryDeletionStageInOrder() {
        UUID profileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                new AccountDeletionStateService.DeletionContext(
                        AccountDeletionStage.REQUESTED,
                        "cus_account"
                )
        );
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        RecordingStorageDeletionService storageService =
                new RecordingStorageDeletionService();
        RecordingApplicationDataDeletionService applicationDataService =
                new RecordingApplicationDataDeletionService();
        RecordingAuthDeletionService authService =
                new RecordingAuthDeletionService();
        AccountDeletionService service = new AccountDeletionService(
                stateService,
                stripeService,
                storageService,
                applicationDataService,
                authService
        );

        AccountDeletionProgressDTO progress = service.beginAccountDeletion(
                profileId,
                confirmedRequest()
        );

        assertThat(stateService.startedProfileId).isEqualTo(profileId);
        assertThat(stripeService.stripeCustomerId).isEqualTo("cus_account");
        assertThat(stateService.stripeCompletedProfileId).isEqualTo(profileId);
        assertThat(storageService.profileId).isEqualTo(profileId);
        assertThat(stateService.storageCompletedProfileId).isEqualTo(profileId);
        assertThat(applicationDataService.profileId).isEqualTo(profileId);
        assertThat(stateService.applicationDataCompletedProfileId).isEqualTo(profileId);
        assertThat(authService.profileId).isEqualTo(profileId);
        assertThat(progress.getStage()).isEqualTo(AccountDeletionStage.COMPLETED);
        assertThat(progress.isAccountDeleted()).isTrue();
    }

    @Test
    void applicationDataStageRetriesOnlyAuthDeletion() {
        UUID profileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                new AccountDeletionStateService.DeletionContext(
                        AccountDeletionStage.APPLICATION_DATA_DELETED,
                        null
                )
        );
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        RecordingStorageDeletionService storageService =
                new RecordingStorageDeletionService();
        RecordingApplicationDataDeletionService applicationDataService =
                new RecordingApplicationDataDeletionService();
        RecordingAuthDeletionService authService =
                new RecordingAuthDeletionService();
        AccountDeletionService service = new AccountDeletionService(
                stateService,
                stripeService,
                storageService,
                applicationDataService,
                authService
        );

        AccountDeletionProgressDTO progress = service.beginAccountDeletion(
                profileId,
                confirmedRequest()
        );

        assertThat(stripeService.stripeCustomerId).isNull();
        assertThat(storageService.profileId).isNull();
        assertThat(applicationDataService.profileId).isNull();
        assertThat(authService.profileId).isEqualTo(profileId);
        assertThat(progress.getStage()).isEqualTo(AccountDeletionStage.COMPLETED);
    }

    @Test
    void completedStageSkipsEveryCleanup() {
        UUID profileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                new AccountDeletionStateService.DeletionContext(
                        AccountDeletionStage.COMPLETED,
                        null
                )
        );
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        RecordingStorageDeletionService storageService =
                new RecordingStorageDeletionService();
        RecordingApplicationDataDeletionService applicationDataService =
                new RecordingApplicationDataDeletionService();
        RecordingAuthDeletionService authService =
                new RecordingAuthDeletionService();
        AccountDeletionService service = new AccountDeletionService(
                stateService,
                stripeService,
                storageService,
                applicationDataService,
                authService
        );

        AccountDeletionProgressDTO progress = service.beginAccountDeletion(
                profileId,
                confirmedRequest()
        );

        assertThat(stripeService.stripeCustomerId).isNull();
        assertThat(storageService.profileId).isNull();
        assertThat(applicationDataService.profileId).isNull();
        assertThat(authService.profileId).isNull();
        assertThat(progress.isAccountDeleted()).isTrue();
    }

    @Test
    void rejectsMissingConfirmationBeforePersistingDeletionIntent() {
        RecordingStateService stateService = new RecordingStateService(null);
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        RecordingStorageDeletionService storageService =
                new RecordingStorageDeletionService();
        RecordingApplicationDataDeletionService applicationDataService =
                new RecordingApplicationDataDeletionService();
        RecordingAuthDeletionService authService =
                new RecordingAuthDeletionService();
        AccountDeletionService service = new AccountDeletionService(
                stateService,
                stripeService,
                storageService,
                applicationDataService,
                authService
        );
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setConfirmation("delete");

        assertThatThrownBy(() -> service.beginAccountDeletion(UUID.randomUUID(), request))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST)
                );

        assertThat(stateService.startedProfileId).isNull();
        assertThat(stripeService.stripeCustomerId).isNull();
        assertThat(storageService.profileId).isNull();
        assertThat(applicationDataService.profileId).isNull();
        assertThat(authService.profileId).isNull();
    }

    private DeleteAccountRequestDTO confirmedRequest() {
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setConfirmation("DELETE");
        return request;
    }

    private static final class RecordingStateService extends AccountDeletionStateService {

        private final DeletionContext context;
        private UUID startedProfileId;
        private UUID stripeCompletedProfileId;
        private UUID storageCompletedProfileId;
        private UUID applicationDataCompletedProfileId;

        private RecordingStateService(DeletionContext context) {
            super(null, null);
            this.context = context;
        }

        @Override
        public DeletionContext begin(UUID profileId) {
            this.startedProfileId = profileId;
            return context;
        }

        @Override
        public AccountDeletionStage markStripeCustomerDeleted(UUID profileId) {
            this.stripeCompletedProfileId = profileId;
            return AccountDeletionStage.STRIPE_CUSTOMER_DELETED;
        }

        @Override
        public AccountDeletionStage markObjectStorageDeleted(UUID profileId) {
            this.storageCompletedProfileId = profileId;
            return AccountDeletionStage.OBJECT_STORAGE_DELETED;
        }

        @Override
        public AccountDeletionStage markApplicationDataDeleted(UUID profileId) {
            this.applicationDataCompletedProfileId = profileId;
            return AccountDeletionStage.APPLICATION_DATA_DELETED;
        }
    }

    private static final class RecordingStripeDeletionService
            extends StripeAccountDeletionService {

        private String stripeCustomerId;

        private RecordingStripeDeletionService() {
            super(null);
        }

        @Override
        public void deleteCustomer(String stripeCustomerId) {
            this.stripeCustomerId = stripeCustomerId;
        }
    }

    private static final class RecordingStorageDeletionService
            extends AccountObjectStorageDeletionService {

        private UUID profileId;

        private RecordingStorageDeletionService() {
            super(null, null);
        }

        @Override
        public void deleteForAccount(UUID profileId) {
            this.profileId = profileId;
        }
    }

    private static final class RecordingApplicationDataDeletionService
            extends AccountApplicationDataDeletionService {

        private UUID profileId;

        private RecordingApplicationDataDeletionService() {
            super(null, null);
        }

        @Override
        public void deleteForAccount(UUID profileId) {
            this.profileId = profileId;
        }
    }

    private static final class RecordingAuthDeletionService
            extends AccountAuthDeletionService {

        private UUID profileId;

        private RecordingAuthDeletionService() {
            super(null, null);
        }

        @Override
        public AccountDeletionStage deleteForAccount(UUID profileId) {
            this.profileId = profileId;
            return AccountDeletionStage.COMPLETED;
        }
    }
}
