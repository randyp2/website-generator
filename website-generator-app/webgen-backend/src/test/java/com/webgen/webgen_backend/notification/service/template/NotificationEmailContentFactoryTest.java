package com.webgen.webgen_backend.notification.service.template;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.notification.config.NotificationEmailProperties;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.profile.entity.Profile;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationEmailContentFactoryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final NotificationEmailContentFactory factory =
            new NotificationEmailContentFactory(properties());

    @Test
    void buildRendersBrandedDarkPortfolioNotification() {
        NotificationEmailContent content = factory.build(delivery(
                NotificationService.TYPE_PORTFOLIO_COMMENTED,
                "<Actor>",
                "actor",
                "Launch & Learn",
                "launch portfolio",
                "<script>Nice & useful</script>"
        ));

        assertThat(content.subject()).isEqualTo("<Actor> commented on your portfolio");
        assertThat(content.htmlBody())
                .contains("<meta name=\"color-scheme\" content=\"dark\">")
                .contains("background:#111111")
                .contains("background:#242424")
                .contains("#CC7D23")
                .contains("https://www.portrn.com/branding/portrn-logo.png")
                .contains("PortRN")
                .contains("View portfolio")
                .contains("https://www.portrn.com/explore/launch%20portfolio")
                .contains("&lt;Actor&gt;")
                .contains("&lt;script&gt;Nice &amp; useful&lt;/script&gt;")
                .doesNotContain("<script>Nice & useful</script>")
                .doesNotContain("PortfolioGen");
        assertThat(content.textBody())
                .contains("View portfolio: https://www.portrn.com/explore/launch%20portfolio")
                .endsWith("PortRN");
    }

    @Test
    void buildOmitsCommentCardAndLinksFollowNotificationToProfile() {
        NotificationEmailDelivery delivery = delivery(
                NotificationService.TYPE_PROFILE_FOLLOWED,
                "Actor Name",
                "actor-name",
                null,
                null,
                null
        );
        delivery.getNotification().setPortfolio(null);

        NotificationEmailContent content = factory.build(delivery);

        assertThat(content.htmlBody())
                .contains("View profile")
                .contains("https://www.portrn.com/actor-name")
                .doesNotContain("border-left:3px solid #CC7D23");
        assertThat(content.textBody())
                .contains("Actor Name started following you.")
                .contains("View profile: https://www.portrn.com/actor-name");
    }

    @Test
    void buildFallsBackToNotificationsPageWithoutADeepLink() {
        NotificationEmailDelivery delivery = delivery(
                "future_notification",
                "Actor Name",
                "actor-name",
                null,
                null,
                null
        );
        delivery.getNotification().setPortfolio(null);

        NotificationEmailContent content = factory.build(delivery);

        assertThat(content.subject()).isEqualTo("You have a new notification");
        assertThat(content.htmlBody())
                .contains("View notifications")
                .contains("https://www.portrn.com/notifications");
    }

    private NotificationEmailDelivery delivery(
            String type,
            String actorName,
            String actorUsername,
            String portfolioTitle,
            String portfolioSlug,
            String commentPreview
    ) {
        Profile recipient = new Profile();
        recipient.setId(UUID.randomUUID());
        recipient.setFullName("Recipient Name");
        recipient.setEmail("recipient@example.com");

        Profile actor = new Profile();
        actor.setId(UUID.randomUUID());
        actor.setFullName(actorName);
        actor.setUsername(actorUsername);

        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setTitle(portfolioTitle);
        portfolio.setSlug(portfolioSlug);

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .recipientProfile(recipient)
                .actorProfile(actor)
                .type(type)
                .portfolio(portfolio)
                .metadata(commentPreview == null
                        ? objectMapper.createObjectNode()
                        : objectMapper.createObjectNode().put("commentPreview", commentPreview))
                .build();

        return NotificationEmailDelivery.builder()
                .id(UUID.randomUUID())
                .notification(notification)
                .recipientProfile(recipient)
                .build();
    }

    private NotificationEmailProperties properties() {
        NotificationEmailProperties properties = new NotificationEmailProperties();
        properties.setAppBaseUrl("https://www.portrn.com/");
        properties.setLogoUrl("https://www.portrn.com/branding/portrn-logo.png");
        return properties;
    }
}
