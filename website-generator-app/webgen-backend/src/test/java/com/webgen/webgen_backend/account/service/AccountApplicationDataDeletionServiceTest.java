package com.webgen.webgen_backend.account.service;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AccountApplicationDataDeletionServiceTest {

    @Test
    void deletesLegacyEmailDataAndFlushesProfileCascade() {
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setEmail("owner@example.com");
        AtomicReference<Profile> deletedProfile = new AtomicReference<>();
        AtomicBoolean flushed = new AtomicBoolean(false);
        AtomicReference<String> deletedEmail = new AtomicReference<>();
        AccountApplicationDataDeletionService service =
                new AccountApplicationDataDeletionService(
                        profileRepository(profile, deletedProfile, flushed),
                        entityManager(deletedEmail)
                );

        service.deleteForAccount(profileId);

        assertThat(deletedEmail).hasValue("owner@example.com");
        assertThat(deletedProfile).hasValue(profile);
        assertThat(flushed).isTrue();
    }

    @Test
    void missingProfileIsAnIdempotentSuccess() {
        AtomicReference<Profile> deletedProfile = new AtomicReference<>();
        AtomicBoolean flushed = new AtomicBoolean(false);
        AtomicReference<String> deletedEmail = new AtomicReference<>();
        AccountApplicationDataDeletionService service =
                new AccountApplicationDataDeletionService(
                        profileRepository(null, deletedProfile, flushed),
                        entityManager(deletedEmail)
                );

        service.deleteForAccount(UUID.randomUUID());

        assertThat(deletedEmail).hasNullValue();
        assertThat(deletedProfile).hasNullValue();
        assertThat(flushed).isFalse();
    }

    private ProfileRepository profileRepository(
            Profile profile,
            AtomicReference<Profile> deletedProfile,
            AtomicBoolean flushed
    ) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdForUpdate" -> Optional.ofNullable(profile);
                    case "delete" -> {
                        deletedProfile.set((Profile) args[0]);
                        yield null;
                    }
                    case "flush" -> {
                        flushed.set(true);
                        yield null;
                    }
                    case "toString" -> "ProfileRepositoryFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private EntityManager entityManager(AtomicReference<String> deletedEmail) {
        AtomicReference<Query> queryReference = new AtomicReference<>();
        Query query = (Query) Proxy.newProxyInstance(
                Query.class.getClassLoader(),
                new Class[]{Query.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "setParameter" -> {
                        if ("email".equals(args[0])) {
                            deletedEmail.set((String) args[1]);
                        }
                        yield queryReference.get();
                    }
                    case "executeUpdate" -> 1;
                    case "toString" -> "DeleteEmailVerificationQuery";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
        queryReference.set(query);

        return (EntityManager) Proxy.newProxyInstance(
                EntityManager.class.getClassLoader(),
                new Class[]{EntityManager.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "createNativeQuery" -> query;
                    case "toString" -> "EntityManagerFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }
}
