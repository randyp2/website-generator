package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.account.entity.AccountDeletionRequest;
import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import com.webgen.webgen_backend.account.repository.AccountDeletionRequestRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
class AccountDeletionStateServiceTest {

    @Test
    void beginsUnderProfileLockAndCapturesStripeCustomerId() {
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setStripeCustomerId("cus_account");
        AccountDeletionRequest request = new AccountDeletionRequest();
        request.setProfileId(profileId);
        request.setStage(AccountDeletionStage.REQUESTED);
        AtomicBoolean inserted = new AtomicBoolean(false);
        ProfileRepository profileRepository = profileRepository(Optional.of(profile));
        AccountDeletionRequestRepository requestRepository = requestRepository(
                Optional.of(request),
                false,
                inserted
        );
        AccountDeletionStateService service = new AccountDeletionStateService(
                requestRepository,
                profileRepository
        );

        AccountDeletionStateService.DeletionContext context = service.begin(profileId);

        assertThat(inserted).isTrue();
        assertThat(context.stage()).isEqualTo(AccountDeletionStage.REQUESTED);
        assertThat(context.stripeCustomerId()).isEqualTo("cus_account");
    }

    @Test
    void blocksBillingAfterDeletionStarts() {
        UUID profileId = UUID.randomUUID();
        ProfileRepository profileRepository = profileRepository(Optional.empty());
        AccountDeletionRequestRepository requestRepository = requestRepository(
                Optional.empty(),
                true,
                new AtomicBoolean(false)
        );
        AccountDeletionStateService service = new AccountDeletionStateService(
                requestRepository,
                profileRepository
        );

        assertThatThrownBy(() -> service.assertAccountActive(profileId))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT)
                );
    }

    private ProfileRepository profileRepository(Optional<Profile> profile) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdForUpdate" -> profile;
                    case "toString" -> "ProfileRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected profile repository method: " + method.getName()
                    );
                }
        );
    }

    private AccountDeletionRequestRepository requestRepository(
            Optional<AccountDeletionRequest> request,
            boolean exists,
            AtomicBoolean inserted
    ) {
        return (AccountDeletionRequestRepository) Proxy.newProxyInstance(
                AccountDeletionRequestRepository.class.getClassLoader(),
                new Class[]{AccountDeletionRequestRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "insertIfAbsent" -> {
                        inserted.set(true);
                        yield 1;
                    }
                    case "findById" -> request;
                    case "existsById" -> exists;
                    case "toString" -> "AccountDeletionRequestRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected deletion repository method: " + method.getName()
                    );
                }
        );
    }
}
