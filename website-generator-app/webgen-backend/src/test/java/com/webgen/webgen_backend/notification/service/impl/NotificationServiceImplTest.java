package com.webgen.webgen_backend.notification.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.repository.NotificationRepository;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioComment;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void createNotificationInsertsAndReturnsMappedDto() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);

        UUID recipientId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        ObjectNode metadata = objectMapper.createObjectNode().put("commentPreview", "Nice work");

        repository.profiles.put(recipientId, profile(recipientId, "Recipient", "recipient"));
        repository.profiles.put(actorId, profile(actorId, "Actor Name", "actor"));
        repository.portfolios.put(portfolioId, portfolio(
                portfolioId,
                "Portfolio Title",
                "portfolio-slug",
                "https://example.com/screenshots/portfolio.png"));
        repository.comments.put(commentId, comment(commentId));

        Optional<NotificationDTO> result = service.createNotification(
                recipientId,
                actorId,
                " COMMENT_LIKED ",
                portfolioId,
                commentId,
                "comment-like:" + commentId + ":" + actorId,
                metadata);

        assertThat(result).isPresent();
        NotificationDTO dto = result.get();
        assertThat(repository.insertCalls).isEqualTo(1);
        assertThat(repository.lastInsert.type()).isEqualTo(NotificationService.TYPE_COMMENT_LIKED);
        assertThat(repository.lastInsert.metadataJson()).contains("Nice work");
        assertThat(dto.getRecipientProfileId()).isEqualTo(recipientId);
        assertThat(dto.getActorProfileId()).isEqualTo(actorId);
        assertThat(dto.getActorName()).isEqualTo("Actor Name");
        assertThat(dto.getActorUsername()).isEqualTo("actor");
        assertThat(dto.getPortfolioId()).isEqualTo(portfolioId);
        assertThat(dto.getPortfolioTitle()).isEqualTo("Portfolio Title");
        assertThat(dto.getPortfolioSlug()).isEqualTo("portfolio-slug");
        assertThat(dto.getPortfolioScreenshotUrl()).isEqualTo("https://example.com/screenshots/portfolio.png");
        assertThat(dto.getCommentId()).isEqualTo(commentId);
        assertThat(dto.getType()).isEqualTo(NotificationService.TYPE_COMMENT_LIKED);
        assertThat(dto.isRead()).isFalse();
        assertThat(dto.getMetadata().path("commentPreview").asText()).isEqualTo("Nice work");
    }

    @Test
    void createNotificationSkipsSelfNotification() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        UUID profileId = UUID.randomUUID();

        Optional<NotificationDTO> result = service.createNotification(
                profileId,
                profileId,
                NotificationService.TYPE_PORTFOLIO_LIKED,
                UUID.randomUUID(),
                null,
                "portfolio-like",
                objectMapper.createObjectNode());

        assertThat(result).isEmpty();
        assertThat(repository.invocations).isZero();
    }

    @Test
    void createNotificationSkipsExistingDedupeKey() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        String dedupeKey = "portfolio-like:1";
        repository.notificationsByDedupeKey.put(dedupeKey, new Notification());

        Optional<NotificationDTO> result = service.createNotification(
                UUID.randomUUID(),
                UUID.randomUUID(),
                NotificationService.TYPE_PORTFOLIO_LIKED,
                UUID.randomUUID(),
                null,
                dedupeKey,
                objectMapper.createObjectNode());

        assertThat(result).isEmpty();
        assertThat(repository.findByDedupeKeyCalls).isEqualTo(1);
        assertThat(repository.insertCalls).isZero();
    }

    @Test
    void createProfileFollowedNotificationAllowsNoPortfolioOrComment() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);

        UUID recipientId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        repository.profiles.put(recipientId, profile(recipientId, "Recipient", "recipient"));
        repository.profiles.put(actorId, profile(actorId, "Actor Name", "actor"));

        Optional<NotificationDTO> result = service.createNotification(
                recipientId,
                actorId,
                NotificationService.TYPE_PROFILE_FOLLOWED,
                null,
                null,
                "profile-follow:" + recipientId + ":" + actorId,
                objectMapper.createObjectNode());

        assertThat(result).isPresent();
        NotificationDTO dto = result.get();
        assertThat(dto.getType()).isEqualTo(NotificationService.TYPE_PROFILE_FOLLOWED);
        assertThat(dto.getPortfolioId()).isNull();
        assertThat(dto.getPortfolioTitle()).isNull();
        assertThat(dto.getPortfolioSlug()).isNull();
        assertThat(dto.getPortfolioScreenshotUrl()).isNull();
        assertThat(dto.getCommentId()).isNull();
        assertThat(dto.getActorUsername()).isEqualTo("actor");
    }

    @Test
    void createNotificationRejectsCommentTypeWithoutCommentId() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);

        assertThatThrownBy(() -> service.createNotification(
                UUID.randomUUID(),
                UUID.randomUUID(),
                NotificationService.TYPE_COMMENT_REPLIED,
                UUID.randomUUID(),
                null,
                "reply",
                objectMapper.createObjectNode()))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        assertThat(repository.invocations).isZero();
    }

    @Test
    void listNotificationsNormalizesPaginationAndMapsRows() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        UUID recipientId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();
        repository.rows = List.of(notification(
                notificationId,
                profile(recipientId, "Recipient", "recipient"),
                null,
                portfolio(UUID.randomUUID(), "Portfolio", "portfolio", "https://example.com/screenshots/list.png"),
                null,
                NotificationService.TYPE_PORTFOLIO_LIKED,
                objectMapper.createObjectNode(),
                null
        ));

        NotificationListResponseDTO response = service.listNotifications(recipientId, -1, 500);

        assertThat(repository.lastPageable.getPageNumber()).isZero();
        assertThat(repository.lastPageable.getPageSize()).isEqualTo(100);
        assertThat(response.getNotifications())
                .hasSize(1)
                .first()
                .satisfies(notification -> {
                    assertThat(notification.getId()).isEqualTo(notificationId);
                    assertThat(notification.getPortfolioScreenshotUrl())
                            .isEqualTo("https://example.com/screenshots/list.png");
                });
    }

    @Test
    void markReadSetsReadAtAndSavesUnreadNotification() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        UUID recipientId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();
        Notification notification = notification(
                notificationId,
                profile(recipientId, "Recipient", "recipient"),
                null,
                portfolio(UUID.randomUUID(), "Portfolio", "portfolio", null),
                null,
                NotificationService.TYPE_PORTFOLIO_LIKED,
                objectMapper.createObjectNode(),
                null
        );
        repository.notificationsById.put(notificationId, notification);

        NotificationDTO result = service.markRead(recipientId, notificationId);

        assertThat(repository.saveCalls).isEqualTo(1);
        assertThat(repository.savedNotification.getReadAt()).isNotNull();
        assertThat(result.isRead()).isTrue();
        assertThat(result.getReadAt()).isNotNull();
    }

    @Test
    void markReadDoesNotSaveAlreadyReadNotification() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        UUID recipientId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();
        OffsetDateTime readAt = OffsetDateTime.parse("2026-01-01T00:00:00Z");
        repository.notificationsById.put(notificationId, notification(
                notificationId,
                profile(recipientId, "Recipient", "recipient"),
                null,
                portfolio(UUID.randomUUID(), "Portfolio", "portfolio", null),
                null,
                NotificationService.TYPE_PORTFOLIO_LIKED,
                objectMapper.createObjectNode(),
                readAt
        ));

        NotificationDTO result = service.markRead(recipientId, notificationId);

        assertThat(repository.saveCalls).isZero();
        assertThat(result.isRead()).isTrue();
        assertThat(result.getReadAt()).isEqualTo(readAt);
    }

    @Test
    void countUnreadAndMarkAllReadHandleNullRecipientWithoutRepositoryCalls() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);

        assertThat(service.countUnread(null)).isZero();
        assertThat(service.markAllRead(null)).isZero();

        assertThat(repository.invocations).isZero();
    }

    @Test
    void markAllReadDelegatesToRepositoryForRecipient() {
        RepositoryStub repository = new RepositoryStub();
        NotificationServiceImpl service = new NotificationServiceImpl(repository.proxy(), objectMapper);
        UUID recipientId = UUID.randomUUID();
        repository.markAllResult = 3;

        assertThat(service.markAllRead(recipientId)).isEqualTo(3);
        assertThat(repository.markAllCalls).isEqualTo(1);
        assertThat(repository.lastMarkAllRecipientId).isEqualTo(recipientId);
        assertThat(repository.lastMarkAllReadAt).isNotNull();
    }

    private Notification notification(
            UUID id,
            Profile recipient,
            Profile actor,
            Portfolio portfolio,
            PortfolioComment comment,
            String type,
            ObjectNode metadata,
            OffsetDateTime readAt) {
        return Notification.builder()
                .id(id)
                .recipientProfile(recipient)
                .actorProfile(actor)
                .portfolio(portfolio)
                .comment(comment)
                .type(type)
                .metadata(metadata)
                .readAt(readAt)
                .createdAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    private Profile profile(UUID id, String fullName, String username) {
        Profile profile = new Profile();
        profile.setId(id);
        profile.setFullName(fullName);
        profile.setUsername(username);
        profile.setAvatarUrl("https://example.com/" + username + ".png");
        return profile;
    }

    private Portfolio portfolio(UUID id, String title, String slug) {
        return portfolio(id, title, slug, null);
    }

    private Portfolio portfolio(UUID id, String title, String slug, String screenshotUrl) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(id);
        portfolio.setTitle(title);
        portfolio.setSlug(slug);
        portfolio.setScreenshotUrl(screenshotUrl);
        return portfolio;
    }

    private PortfolioComment comment(UUID id) {
        PortfolioComment comment = new PortfolioComment();
        comment.setId(id);
        return comment;
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

    private class RepositoryStub {
        private final Map<UUID, Notification> notificationsById = new HashMap<>();
        private final Map<String, Notification> notificationsByDedupeKey = new HashMap<>();
        private final Map<UUID, Profile> profiles = new HashMap<>();
        private final Map<UUID, Portfolio> portfolios = new HashMap<>();
        private final Map<UUID, PortfolioComment> comments = new HashMap<>();

        private int invocations;
        private int findByDedupeKeyCalls;
        private int insertCalls;
        private int saveCalls;
        private int markAllCalls;
        private int markAllResult;
        private long unreadCount;
        private List<Notification> rows = List.of();
        private Pageable lastPageable;
        private InsertCall lastInsert;
        private Notification savedNotification;
        private UUID lastMarkAllRecipientId;
        private OffsetDateTime lastMarkAllReadAt;

        private NotificationRepository proxy() {
            return (NotificationRepository) Proxy.newProxyInstance(
                    NotificationRepository.class.getClassLoader(),
                    new Class[]{NotificationRepository.class},
                    (proxy, method, args) -> {
                        if (method.getDeclaringClass() == Object.class) {
                            return handleObjectMethod(proxy, method.getName(), args);
                        }

                        invocations++;
                        return switch (method.getName()) {
                            case "findByRecipientProfile_IdOrderByCreatedAtDesc" -> {
                                lastPageable = (Pageable) args[1];
                                yield new PageImpl<>(rows);
                            }
                            case "findByIdAndRecipientProfile_Id" -> {
                                UUID notificationId = (UUID) args[0];
                                UUID recipientProfileId = (UUID) args[1];
                                Notification notification = notificationsById.get(notificationId);
                                if (notification == null
                                        || notification.getRecipientProfile() == null
                                        || !recipientProfileId.equals(notification.getRecipientProfile().getId())) {
                                    yield Optional.empty();
                                }
                                yield Optional.of(notification);
                            }
                            case "findByDedupeKey" -> {
                                findByDedupeKeyCalls++;
                                yield Optional.ofNullable(notificationsByDedupeKey.get((String) args[0]));
                            }
                            case "countByRecipientProfile_IdAndReadAtIsNull" -> unreadCount;
                            case "markUnreadNotificationsRead" -> {
                                markAllCalls++;
                                lastMarkAllRecipientId = (UUID) args[0];
                                lastMarkAllReadAt = (OffsetDateTime) args[1];
                                yield markAllResult;
                            }
                            case "insertIgnore" -> insertIgnore(args);
                            case "save" -> {
                                saveCalls++;
                                savedNotification = (Notification) args[0];
                                notificationsById.put(savedNotification.getId(), savedNotification);
                                yield savedNotification;
                            }
                            default -> throw new UnsupportedOperationException(
                                    "Unexpected repository method invocation: " + method.getName()
                            );
                        };
                    }
            );
        }

        private int insertIgnore(Object[] args) throws Exception {
            insertCalls++;
            UUID notificationId = (UUID) args[0];
            UUID recipientProfileId = (UUID) args[1];
            UUID actorProfileId = (UUID) args[2];
            String type = (String) args[3];
            UUID portfolioId = (UUID) args[4];
            UUID commentId = (UUID) args[5];
            String dedupeKey = (String) args[6];
            String metadataJson = (String) args[7];
            OffsetDateTime createdAt = (OffsetDateTime) args[8];

            lastInsert = new InsertCall(type, metadataJson);

            Notification notification = Notification.builder()
                    .id(notificationId)
                    .recipientProfile(profiles.computeIfAbsent(
                            recipientProfileId,
                            id -> profile(id, null, null)
                    ))
                    .actorProfile(actorProfileId == null
                            ? null
                            : profiles.computeIfAbsent(actorProfileId, id -> profile(id, null, null)))
                    .type(type)
                    .portfolio(portfolioId == null
                            ? null
                            : portfolios.computeIfAbsent(portfolioId, id -> portfolio(id, null, null)))
                    .comment(commentId == null
                            ? null
                            : comments.computeIfAbsent(commentId, NotificationServiceImplTest.this::comment))
                    .dedupeKey(dedupeKey)
                    .metadata((ObjectNode) objectMapper.readTree(metadataJson))
                    .createdAt(createdAt)
                    .build();

            notificationsById.put(notificationId, notification);
            if (dedupeKey != null) {
                notificationsByDedupeKey.put(dedupeKey, notification);
            }
            return 1;
        }
    }

    private record InsertCall(String type, String metadataJson) {
    }
}
