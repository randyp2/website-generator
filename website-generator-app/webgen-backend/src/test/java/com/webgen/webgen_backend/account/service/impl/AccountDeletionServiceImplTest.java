package com.webgen.webgen_backend.account.service.impl;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.account.service.StripeAccountDeletionService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AccountDeletionServiceImplTest {

    @Test
    void deletesStripeCustomerAndPersistsCompletedStage() {
        UUID profileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                new AccountDeletionStateService.DeletionContext(
                        AccountDeletionStage.REQUESTED,
                        "cus_account"
                )
        );
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        AccountDeletionServiceImpl service = new AccountDeletionServiceImpl(
                stateService,
                stripeService
        );

        AccountDeletionProgressDTO progress = service.beginAccountDeletion(
                profileId,
                confirmedRequest()
        );

        assertThat(stateService.startedProfileId).isEqualTo(profileId);
        assertThat(stripeService.stripeCustomerId).isEqualTo("cus_account");
        assertThat(stateService.completedProfileId).isEqualTo(profileId);
        assertThat(progress.getStage())
                .isEqualTo(AccountDeletionStage.STRIPE_CUSTOMER_DELETED);
        assertThat(progress.isAccountDeleted()).isFalse();
    }

    @Test
    void completedStripeStageIsIdempotent() {
        UUID profileId = UUID.randomUUID();
        RecordingStateService stateService = new RecordingStateService(
                new AccountDeletionStateService.DeletionContext(
                        AccountDeletionStage.STRIPE_CUSTOMER_DELETED,
                        "cus_account"
                )
        );
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        AccountDeletionServiceImpl service = new AccountDeletionServiceImpl(
                stateService,
                stripeService
        );

        AccountDeletionProgressDTO progress = service.beginAccountDeletion(
                profileId,
                confirmedRequest()
        );

        assertThat(stripeService.stripeCustomerId).isNull();
        assertThat(stateService.completedProfileId).isNull();
        assertThat(progress.getStage())
                .isEqualTo(AccountDeletionStage.STRIPE_CUSTOMER_DELETED);
    }

    @Test
    void rejectsMissingConfirmationBeforePersistingDeletionIntent() {
        RecordingStateService stateService = new RecordingStateService(null);
        RecordingStripeDeletionService stripeService =
                new RecordingStripeDeletionService();
        AccountDeletionServiceImpl service = new AccountDeletionServiceImpl(
                stateService,
                stripeService
        );
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setConfirmation("delete");

        assertThatThrownBy(() -> service.beginAccountDeletion(UUID.randomUUID(), request))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST)
                );

        assertThat(stateService.startedProfileId).isNull();
        assertThat(stripeService.stripeCustomerId).isNull();
    }

    private DeleteAccountRequestDTO confirmedRequest() {
        DeleteAccountRequestDTO request = new DeleteAccountRequestDTO();
        request.setConfirmation("DELETE");
        return request;
    }

    private static final class RecordingStateService
            extends AccountDeletionStateService {

        private final DeletionContext context;
        private UUID startedProfileId;
        private UUID completedProfileId;

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
            this.completedProfileId = profileId;
            return AccountDeletionStage.STRIPE_CUSTOMER_DELETED;
        }
    }

    private static final class RecordingStripeDeletionService
            implements StripeAccountDeletionService {

        private String stripeCustomerId;

        @Override
        public void deleteCustomer(String stripeCustomerId) {
            this.stripeCustomerId = stripeCustomerId;
        }
    }
}
