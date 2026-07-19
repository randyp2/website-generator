package com.webgen.webgen_backend.portfolio.service.engagement;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.portfolio.dto.engagement.CreatePortfolioCommentRequestDTO;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioComment;
import com.webgen.webgen_backend.portfolio.repository.PortfolioCommentLikeRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioCommentRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioEngagementCounterRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioLikeRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PortfolioEngagementServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void likePortfolioCreatesNotificationOnlyWhenLikeWasInserted() {
        Fixture fixture = new Fixture();

        fixture.portfolioLikeInsertResult = 1;
        fixture.service().likePortfolio(fixture.actorId, fixture.portfolioId);

        assertThat(fixture.notifications.events).hasSize(1);
        NotificationEvent event = fixture.notifications.events.getFirst();
        assertThat(event.recipientProfileId()).isEqualTo(fixture.ownerId);
        assertThat(event.actorProfileId()).isEqualTo(fixture.actorId);
        assertThat(event.type()).isEqualTo(NotificationService.TYPE_PORTFOLIO_LIKED);
        assertThat(event.portfolioId()).isEqualTo(fixture.portfolioId);
        assertThat(event.commentId()).isNull();
        assertThat(event.dedupeKey())
                .isEqualTo("portfolio_like:" + fixture.portfolioId + ":" + fixture.actorId);

        Fixture duplicateFixture = new Fixture();
        duplicateFixture.portfolioLikeInsertResult = 0;
        duplicateFixture.service().likePortfolio(duplicateFixture.actorId, duplicateFixture.portfolioId);

        assertThat(duplicateFixture.notifications.events).isEmpty();
    }

    @Test
    void createTopLevelCommentNotifiesPortfolioOwner() {
        Fixture fixture = new Fixture();
        CreatePortfolioCommentRequestDTO request = new CreatePortfolioCommentRequestDTO();
        request.setBody("This portfolio is excellent.");

        fixture.service().createComment(fixture.actorId, fixture.portfolioId, request);

        assertThat(fixture.notifications.events).hasSize(1);
        NotificationEvent event = fixture.notifications.events.getFirst();
        assertThat(event.recipientProfileId()).isEqualTo(fixture.ownerId);
        assertThat(event.actorProfileId()).isEqualTo(fixture.actorId);
        assertThat(event.type()).isEqualTo(NotificationService.TYPE_PORTFOLIO_COMMENTED);
        assertThat(event.portfolioId()).isEqualTo(fixture.portfolioId);
        assertThat(event.commentId()).isNotNull();
        assertThat(event.dedupeKey()).isEqualTo("portfolio_comment:" + event.commentId());
        assertThat(event.metadata().path("commentPreview").asText()).isEqualTo("This portfolio is excellent.");
    }

    @Test
    void createReplyNotifiesParentCommentAuthor() {
        Fixture fixture = new Fixture();
        UUID parentAuthorId = UUID.randomUUID();
        fixture.profiles.put(parentAuthorId, profile(parentAuthorId));
        PortfolioComment parent = fixture.comment(UUID.randomUUID(), parentAuthorId);
        fixture.comments.put(parent.getId(), parent);

        CreatePortfolioCommentRequestDTO request = new CreatePortfolioCommentRequestDTO();
        request.setParentCommentId(parent.getId());
        request.setBody("I agree with this take.");

        fixture.service().createComment(fixture.actorId, fixture.portfolioId, request);

        assertThat(fixture.notifications.events).hasSize(1);
        NotificationEvent event = fixture.notifications.events.getFirst();
        assertThat(event.recipientProfileId()).isEqualTo(parentAuthorId);
        assertThat(event.actorProfileId()).isEqualTo(fixture.actorId);
        assertThat(event.type()).isEqualTo(NotificationService.TYPE_COMMENT_REPLIED);
        assertThat(event.commentId()).isNotNull();
        assertThat(event.dedupeKey()).isEqualTo("comment_reply:" + event.commentId());
    }

    @Test
    void likeCommentCreatesNotificationOnlyWhenLikeWasInserted() {
        Fixture fixture = new Fixture();
        UUID commentAuthorId = UUID.randomUUID();
        fixture.profiles.put(commentAuthorId, profile(commentAuthorId));
        PortfolioComment comment = fixture.comment(UUID.randomUUID(), commentAuthorId);
        fixture.comments.put(comment.getId(), comment);

        fixture.commentLikeInsertResult = 1;
        fixture.service().likeComment(fixture.actorId, comment.getId());

        assertThat(fixture.notifications.events).hasSize(1);
        NotificationEvent event = fixture.notifications.events.getFirst();
        assertThat(event.recipientProfileId()).isEqualTo(commentAuthorId);
        assertThat(event.actorProfileId()).isEqualTo(fixture.actorId);
        assertThat(event.type()).isEqualTo(NotificationService.TYPE_COMMENT_LIKED);
        assertThat(event.portfolioId()).isEqualTo(fixture.portfolioId);
        assertThat(event.commentId()).isEqualTo(comment.getId());
        assertThat(event.dedupeKey())
                .isEqualTo("comment_like:" + comment.getId() + ":" + fixture.actorId);

        Fixture duplicateFixture = new Fixture();
        PortfolioComment duplicateComment = duplicateFixture.comment(UUID.randomUUID(), duplicateFixture.ownerId);
        duplicateFixture.comments.put(duplicateComment.getId(), duplicateComment);
        duplicateFixture.commentLikeInsertResult = 0;
        duplicateFixture.service().likeComment(duplicateFixture.actorId, duplicateComment.getId());

        assertThat(duplicateFixture.notifications.events).isEmpty();
    }

    private Profile profile(UUID id) {
        Profile profile = new Profile();
        profile.setId(id);
        profile.setFullName("Profile " + id);
        profile.setUsername("user-" + id);
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
        private final UUID ownerId = UUID.randomUUID();
        private final UUID actorId = UUID.randomUUID();
        private final UUID portfolioId = UUID.randomUUID();
        private final Map<UUID, Profile> profiles = new HashMap<>();
        private final Map<UUID, PortfolioComment> comments = new HashMap<>();
        private final NotificationRecorder notifications = new NotificationRecorder();
        private int portfolioLikeInsertResult = 0;
        private int commentLikeInsertResult = 0;

        private Fixture() {
            profiles.put(ownerId, profile(ownerId));
            profiles.put(actorId, profile(actorId));
        }

        private PortfolioEngagementServiceImpl service() {
            return new PortfolioEngagementServiceImpl(
                    portfolioRepository(),
                    profileRepository(),
                    counterRepository(),
                    portfolioLikeRepository(),
                    commentRepository(),
                    commentLikeRepository(),
                    notifications,
                    objectMapper);
        }

        private Portfolio portfolio() {
            Portfolio portfolio = new Portfolio();
            portfolio.setId(portfolioId);
            portfolio.setUserId(ownerId);
            portfolio.setStatus("publish");
            portfolio.setSlug("published-portfolio");
            portfolio.setTitle("Published Portfolio");
            return portfolio;
        }

        private PortfolioComment comment(UUID commentId, UUID authorId) {
            PortfolioComment comment = PortfolioComment.builder()
                    .id(commentId)
                    .portfolio(portfolio())
                    .profile(profiles.get(authorId))
                    .body("Existing comment body")
                    .status("visible")
                    .likesCount(0)
                    .repliesCount(0)
                    .createdAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                    .updatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"))
                    .build();
            return comment;
        }

        private PortfolioRepository portfolioRepository() {
            return (PortfolioRepository) Proxy.newProxyInstance(
                    PortfolioRepository.class.getClassLoader(),
                    new Class[]{PortfolioRepository.class},
                    (proxy, method, args) -> {
                        if ("findById".equals(method.getName())) {
                            return Optional.of(portfolio());
                        }
                        return handleObjectMethod(proxy, method.getName(), args);
                    });
        }

        private ProfileRepository profileRepository() {
            return (ProfileRepository) Proxy.newProxyInstance(
                    ProfileRepository.class.getClassLoader(),
                    new Class[]{ProfileRepository.class},
                    (proxy, method, args) -> {
                        if ("findById".equals(method.getName())) {
                            return Optional.ofNullable(profiles.get((UUID) args[0]));
                        }
                        return handleObjectMethod(proxy, method.getName(), args);
                    });
        }

        private PortfolioEngagementCounterRepository counterRepository() {
            return (PortfolioEngagementCounterRepository) Proxy.newProxyInstance(
                    PortfolioEngagementCounterRepository.class.getClassLoader(),
                    new Class[]{PortfolioEngagementCounterRepository.class},
                    (proxy, method, args) -> {
                        if ("findById".equals(method.getName())) {
                            return Optional.empty();
                        }
                        return handleObjectMethod(proxy, method.getName(), args);
                    });
        }

        private PortfolioLikeRepository portfolioLikeRepository() {
            return (PortfolioLikeRepository) Proxy.newProxyInstance(
                    PortfolioLikeRepository.class.getClassLoader(),
                    new Class[]{PortfolioLikeRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "insertIgnore" -> portfolioLikeInsertResult;
                        case "existsByPortfolio_IdAndProfile_Id" -> portfolioLikeInsertResult == 1;
                        default -> handleObjectMethod(proxy, method.getName(), args);
                    });
        }

        private PortfolioCommentRepository commentRepository() {
            return (PortfolioCommentRepository) Proxy.newProxyInstance(
                    PortfolioCommentRepository.class.getClassLoader(),
                    new Class[]{PortfolioCommentRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findById" -> Optional.ofNullable(comments.get((UUID) args[0]));
                        case "save" -> {
                            PortfolioComment comment = (PortfolioComment) args[0];
                            comments.put(comment.getId(), comment);
                            yield comment;
                        }
                        case "findByParentComment_IdAndStatusOrderByCreatedAtAsc" -> List.of();
                        default -> handleObjectMethod(proxy, method.getName(), args);
                    });
        }

        private PortfolioCommentLikeRepository commentLikeRepository() {
            return (PortfolioCommentLikeRepository) Proxy.newProxyInstance(
                    PortfolioCommentLikeRepository.class.getClassLoader(),
                    new Class[]{PortfolioCommentLikeRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "insertIgnore" -> commentLikeInsertResult;
                        case "existsByComment_IdAndProfile_Id" -> commentLikeInsertResult == 1;
                        default -> handleObjectMethod(proxy, method.getName(), args);
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
