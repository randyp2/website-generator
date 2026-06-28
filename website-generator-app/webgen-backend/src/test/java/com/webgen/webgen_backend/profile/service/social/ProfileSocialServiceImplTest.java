package com.webgen.webgen_backend.profile.service.social;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileFollowRepository;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.profile.repository.ProfileSocialCounterRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileSocialServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void followProfileCreatesNotificationOnlyWhenFollowWasInserted() {
        Fixture fixture = new Fixture();

        fixture.followInsertResult = 1;
        fixture.service().followProfile(fixture.followerId, fixture.followedId);

        assertThat(fixture.notifications.events).hasSize(1);
        NotificationEvent event = fixture.notifications.events.get(0);
        assertThat(event.recipientProfileId()).isEqualTo(fixture.followedId);
        assertThat(event.actorProfileId()).isEqualTo(fixture.followerId);
        assertThat(event.type()).isEqualTo(NotificationService.TYPE_PROFILE_FOLLOWED);
        assertThat(event.portfolioId()).isNull();
        assertThat(event.commentId()).isNull();
        assertThat(event.dedupeKey()).isNull();

        Fixture duplicateFixture = new Fixture();
        duplicateFixture.followInsertResult = 0;
        duplicateFixture.service().followProfile(duplicateFixture.followerId, duplicateFixture.followedId);

        assertThat(duplicateFixture.notifications.events).isEmpty();
    }

    private Profile profile(UUID id) {
        Profile profile = new Profile();
        profile.setId(id);
        profile.setUsername("user-" + id);
        profile.setFullName("Profile " + id);
        profile.setOnboardingComplete(true);
        return profile;
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

    private class Fixture {
        private final UUID followerId = UUID.randomUUID();
        private final UUID followedId = UUID.randomUUID();
        private final Map<UUID, Profile> profiles = new HashMap<>();
        private final NotificationRecorder notifications = new NotificationRecorder();
        private int followInsertResult = 0;

        private Fixture() {
            profiles.put(followerId, profile(followerId));
            profiles.put(followedId, profile(followedId));
        }

        private ProfileSocialServiceImpl service() {
            return new ProfileSocialServiceImpl(
                    profileRepository(),
                    profileFollowRepository(),
                    counterRepository(),
                    notifications,
                    objectMapper);
        }

        private ProfileRepository profileRepository() {
            return (ProfileRepository) Proxy.newProxyInstance(
                    ProfileRepository.class.getClassLoader(),
                    new Class[]{ProfileRepository.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return handleObjectMethod(proxy, method.getName(), args);
                        }

                        return switch (method.getName()) {
                            case "findById" -> Optional.ofNullable(profiles.get((UUID) args[0]));
                            case "save" -> {
                                Profile profile = (Profile) args[0];
                                profiles.put(profile.getId(), profile);
                                yield profile;
                            }
                            default -> throw new UnsupportedOperationException(
                                    "Unexpected repository method invocation: " + method.getName()
                            );
                        };
                    });
        }

        private ProfileFollowRepository profileFollowRepository() {
            return (ProfileFollowRepository) Proxy.newProxyInstance(
                    ProfileFollowRepository.class.getClassLoader(),
                    new Class[]{ProfileFollowRepository.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return handleObjectMethod(proxy, method.getName(), args);
                        }

                        return switch (method.getName()) {
                            case "insertIgnore" -> followInsertResult;
                            case "existsByFollowerProfile_IdAndFollowedProfile_Id" -> followInsertResult == 1;
                            default -> throw new UnsupportedOperationException(
                                    "Unexpected repository method invocation: " + method.getName()
                            );
                        };
                    });
        }

        private ProfileSocialCounterRepository counterRepository() {
            return (ProfileSocialCounterRepository) Proxy.newProxyInstance(
                    ProfileSocialCounterRepository.class.getClassLoader(),
                    new Class[]{ProfileSocialCounterRepository.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return handleObjectMethod(proxy, method.getName(), args);
                        }

                        if ("findById".equals(method.getName())) {
                            return Optional.empty();
                        }

                        throw new UnsupportedOperationException(
                                "Unexpected repository method invocation: " + method.getName()
                        );
                    });
        }
    }

    private static class NotificationRecorder implements NotificationService {
        private final List<NotificationEvent> events = new ArrayList<>();

        @Override
        public NotificationListResponseDTO listNotifications(UUID recipientProfileId, Integer page, Integer size) {
            throw new UnsupportedOperationException();
        }

        @Override
        public long countUnread(UUID recipientProfileId) {
            throw new UnsupportedOperationException();
        }

        @Override
        public NotificationDTO markRead(UUID recipientProfileId, UUID notificationId) {
            throw new UnsupportedOperationException();
        }

        @Override
        public int markAllRead(UUID recipientProfileId) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Optional<NotificationDTO> createNotification(
                UUID recipientProfileId,
                UUID actorProfileId,
                String type,
                UUID portfolioId,
                UUID commentId,
                String dedupeKey,
                JsonNode metadata) {
            events.add(new NotificationEvent(
                    recipientProfileId,
                    actorProfileId,
                    type,
                    portfolioId,
                    commentId,
                    dedupeKey,
                    metadata));
            return Optional.empty();
        }
    }

    private record NotificationEvent(
            UUID recipientProfileId,
            UUID actorProfileId,
            String type,
            UUID portfolioId,
            UUID commentId,
            String dedupeKey,
            JsonNode metadata) {
    }
}
