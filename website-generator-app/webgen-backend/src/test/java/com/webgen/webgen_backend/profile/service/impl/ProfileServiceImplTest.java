package com.webgen.webgen_backend.profile.service.impl;

import com.webgen.webgen_backend.account.repository.AccountDeletionRequestRepository;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.billing.service.BillingStatusReader;
import com.webgen.webgen_backend.profile.dto.ProfileMeDTO;
import com.webgen.webgen_backend.profile.dto.PublicProfileDTO;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.mapper.ProfileMapper;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileServiceImplTest {

    @Test
    void synchronizesNormalizedEmailFromAuthenticatedIdentity() {
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setOnboardingComplete(false);
        RepositoryState state = new RepositoryState(profile);
        ProfileRepository profileRepository = profileRepository(state);
        ProfileServiceImpl service = new ProfileServiceImpl(
                profileRepository,
                profileMapper(),
                noBillingStatus(),
                accountDeletionStateService(profileRepository)
        );

        ProfileMeDTO result = service.getOrCreateMyProfile(
                profileId,
                "  Launch.User@Example.COM "
        );

        assertThat(profile.getEmail()).isEqualTo("launch.user@example.com");
        assertThat(result.getEmail()).isEqualTo("launch.user@example.com");
        assertThat(state.saveCount).isEqualTo(1);
    }

    @Test
    void ignoresMalformedAuthenticatedEmail() {
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setEmail("current@example.com");
        profile.setOnboardingComplete(false);
        RepositoryState state = new RepositoryState(profile);
        ProfileRepository profileRepository = profileRepository(state);
        ProfileServiceImpl service = new ProfileServiceImpl(
                profileRepository,
                profileMapper(),
                noBillingStatus(),
                accountDeletionStateService(profileRepository)
        );

        ProfileMeDTO result = service.getOrCreateMyProfile(profileId, "not-an-email");

        assertThat(result.getEmail()).isEqualTo("current@example.com");
        assertThat(state.saveCount).isZero();
    }

    private AccountDeletionStateService accountDeletionStateService(
            ProfileRepository profileRepository
    ) {
        AccountDeletionRequestRepository deletionRepository = repositoryProxy(
                AccountDeletionRequestRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "existsById" -> false;
                    default -> UNHANDLED;
                }
        );
        return new AccountDeletionStateService(deletionRepository, profileRepository);
    }

    private BillingStatusReader noBillingStatus() {
        return profileId -> null;
    }

    private ProfileMapper profileMapper() {
        return new ProfileMapper() {
            @Override
            public ProfileMeDTO toMeDto(Profile profile) {
                return ProfileMeDTO.builder()
                        .id(profile.getId())
                        .email(profile.getEmail())
                        .onboardingComplete(profile.getOnboardingComplete())
                        .build();
            }

            @Override
            public PublicProfileDTO toPublicDto(Profile profile) {
                return null;
            }
        };
    }

    private ProfileRepository profileRepository(RepositoryState state) {
        return repositoryProxy(
                ProfileRepository.class,
                (methodName, args) -> switch (methodName) {
                    case "findById" -> Optional.of(state.profile);
                    case "save" -> {
                        state.saveCount += 1;
                        yield args[0];
                    }
                    default -> UNHANDLED;
                }
        );
    }

    private <T> T repositoryProxy(Class<T> repositoryType, RepositoryInvocation invocation) {
        Object proxy = Proxy.newProxyInstance(
                repositoryType.getClassLoader(),
                new Class[]{repositoryType},
                (instance, method, args) -> {
                    Object result = invocation.invoke(method.getName(), args);
                    if (result != UNHANDLED) {
                        return result;
                    }
                    return handleObjectMethod(instance, method.getName(), args);
                }
        );
        return repositoryType.cast(proxy);
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName
            );
        };
    }

    private static final Object UNHANDLED = new Object();

    @FunctionalInterface
    private interface RepositoryInvocation {
        Object invoke(String methodName, Object[] args);
    }

    private static final class RepositoryState {
        private final Profile profile;
        private int saveCount;

        private RepositoryState(Profile profile) {
            this.profile = profile;
        }
    }
}
