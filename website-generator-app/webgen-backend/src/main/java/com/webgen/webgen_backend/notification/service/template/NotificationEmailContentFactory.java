package com.webgen.webgen_backend.notification.service.template;

import com.fasterxml.jackson.databind.JsonNode;
import com.webgen.webgen_backend.notification.config.NotificationEmailProperties;
import com.webgen.webgen_backend.notification.entity.Notification;
import com.webgen.webgen_backend.notification.entity.NotificationEmailDelivery;
import com.webgen.webgen_backend.notification.service.NotificationService;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.profile.entity.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Year;
import java.time.ZoneOffset;

/**
 * Builds branded, email-client-safe content for notification deliveries.
 *
 * <p>The HTML intentionally uses presentation tables and inline styles because
 * many email clients strip application stylesheets, CSS variables, and modern
 * layout rules.</p>
 */
@Service
@RequiredArgsConstructor
public class NotificationEmailContentFactory {

    private static final String PRODUCT_NAME = "PortRN";

    private final NotificationEmailProperties properties;

    /**
     * Renders both HTML and plain-text bodies for a claimed delivery.
     *
     * @param delivery claimed notification delivery
     * @return provider-ready subject and message bodies
     */
    public NotificationEmailContent build(NotificationEmailDelivery delivery) {
        Notification notification = delivery.getNotification();
        String recipientName = displayName(delivery.getRecipientProfile(), "there");
        String actorName = displayName(notification == null ? null : notification.getActorProfile(), "Someone");
        String portfolioTitle = portfolioTitle(notification);
        String commentPreview = commentPreview(notification);
        String type = notification == null ? null : notification.getType();
        NotificationAction action = action(notification);

        String subject = subject(type, actorName);
        String summary = summary(type, actorName, portfolioTitle);
        String htmlBody = htmlBody(recipientName, summary, commentPreview, action);
        String textBody = textBody(recipientName, summary, commentPreview, action);

        return new NotificationEmailContent(subject, htmlBody, textBody);
    }

    private String subject(String type, String actorName) {
        return switch (type == null ? "" : type) {
            case NotificationService.TYPE_PORTFOLIO_LIKED -> actorName + " liked your portfolio";
            case NotificationService.TYPE_PORTFOLIO_COMMENTED -> actorName + " commented on your portfolio";
            case NotificationService.TYPE_COMMENT_REPLIED -> actorName + " replied to your comment";
            case NotificationService.TYPE_COMMENT_LIKED -> actorName + " liked your comment";
            case NotificationService.TYPE_PROFILE_FOLLOWED -> actorName + " followed you";
            default -> "You have a new notification";
        };
    }

    private String summary(String type, String actorName, String portfolioTitle) {
        return switch (type == null ? "" : type) {
            case NotificationService.TYPE_PORTFOLIO_LIKED ->
                    actorName + " liked " + portfolioTitle + ".";
            case NotificationService.TYPE_PORTFOLIO_COMMENTED ->
                    actorName + " commented on " + portfolioTitle + ".";
            case NotificationService.TYPE_COMMENT_REPLIED ->
                    actorName + " replied to your comment on " + portfolioTitle + ".";
            case NotificationService.TYPE_COMMENT_LIKED ->
                    actorName + " liked your comment on " + portfolioTitle + ".";
            case NotificationService.TYPE_PROFILE_FOLLOWED ->
                    actorName + " started following you.";
            default -> "You have a new notification.";
        };
    }

    private String textBody(
            String recipientName,
            String summary,
            String commentPreview,
            NotificationAction action
    ) {
        StringBuilder body = new StringBuilder()
                .append("Hi ")
                .append(recipientName)
                .append(",\n\n")
                .append(summary);

        if (StringUtils.hasText(commentPreview)) {
            body.append("\n\n\"")
                    .append(commentPreview.trim())
                    .append("\"");
        }

        return body.append("\n\n")
                .append(action.label())
                .append(": ")
                .append(action.url())
                .append("\n\n")
                .append(PRODUCT_NAME)
                .toString();
    }

    private String htmlBody(
            String recipientName,
            String summary,
            String commentPreview,
            NotificationAction action
    ) {
        String safeRecipientName = escape(recipientName);
        String safeSummary = escape(summary);
        String safeActionUrl = escape(action.url());
        String safeActionLabel = escape(action.label());
        String safeLogoUrl = escape(resolveLogoUrl());
        String commentBlock = commentBlock(commentPreview);
        int currentYear = Year.now(ZoneOffset.UTC).getValue();

        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <meta name="color-scheme" content="dark">
                  <meta name="supported-color-schemes" content="dark">
                  <title>PortRN notification</title>
                </head>
                <body style="margin:0;padding:0;background:#111111;color:#EBEBEB;color-scheme:dark;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">%s</div>
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" bgcolor="#111111" style="width:100%%;background:#111111;">
                    <tr>
                      <td align="center" style="padding:40px 16px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%%;max-width:600px;">
                          <tr>
                            <td style="padding:0 4px 20px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="vertical-align:middle;padding-right:12px;">
                                    <img src="%s" width="44" height="44" alt="PortRN" style="display:block;width:44px;height:44px;border:0;border-radius:10px;">
                                  </td>
                                  <td style="vertical-align:middle;">
                                    <div style="font-size:20px;line-height:24px;font-weight:700;letter-spacing:0.04em;color:#F4F4F5;">PortRN</div>
                                    <div style="margin-top:2px;font-size:12px;line-height:16px;color:#A3A3A3;">Portfolio activity</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor="#242424" style="background:#242424;border:1px solid #3D3D3D;border-radius:12px;padding:36px 36px 32px;box-shadow:0 18px 60px rgba(0,0,0,0.28);">
                              <div style="width:40px;height:3px;background:#CC7D23;border-radius:999px;margin-bottom:28px;"></div>
                              <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#B5B5B5;">Hi %s,</p>
                              <h1 style="margin:0 0 14px;font-size:28px;line-height:34px;font-weight:650;letter-spacing:-0.02em;color:#F4F4F5;">You have new activity.</h1>
                              <p style="margin:0;font-size:16px;line-height:26px;color:#D4D4D4;">%s</p>
                              %s
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                                <tr>
                                  <td bgcolor="#CC7D23" style="background:#CC7D23;border-radius:7px;">
                                    <a href="%s" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 20px;font-size:14px;line-height:18px;font-weight:700;color:#111111;text-decoration:none;">%s</a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:24px 0 0;font-size:12px;line-height:19px;color:#8A8A8A;">Keep building, sharing, and connecting through PortRN.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 4px 0;text-align:center;font-size:11px;line-height:18px;color:#737373;">
                              &copy; %d PortRN. You received this email because there was activity on your account.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                safeSummary,
                safeLogoUrl,
                safeRecipientName,
                safeSummary,
                commentBlock,
                safeActionUrl,
                safeActionLabel,
                currentYear
        );
    }

    private String commentBlock(String commentPreview) {
        if (!StringUtils.hasText(commentPreview)) {
            return "";
        }

        return """
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="width:100%%;margin-top:22px;">
                  <tr>
                    <td bgcolor="#1A1A1A" style="background:#1A1A1A;border-left:3px solid #CC7D23;border-radius:6px;padding:15px 17px;font-size:14px;line-height:22px;color:#C7C7C7;font-style:italic;">
                      &ldquo;%s&rdquo;
                    </td>
                  </tr>
                </table>
                """.formatted(escape(commentPreview.trim()));
    }

    private NotificationAction action(Notification notification) {
        if (notification != null) {
            Portfolio portfolio = notification.getPortfolio();
            if (portfolio != null && StringUtils.hasText(portfolio.getSlug())) {
                return new NotificationAction(
                        "View portfolio",
                        applicationUrl("explore", portfolio.getSlug().trim())
                );
            }

            Profile actor = notification.getActorProfile();
            if (NotificationService.TYPE_PROFILE_FOLLOWED.equals(notification.getType())
                    && actor != null
                    && StringUtils.hasText(actor.getUsername())) {
                return new NotificationAction(
                        "View profile",
                        applicationUrl(actor.getUsername().trim())
                );
            }
        }

        return new NotificationAction("View notifications", applicationUrl("notifications"));
    }

    private String applicationUrl(String... pathSegments) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(normalizedAppBaseUrl());
        for (String pathSegment : pathSegments) {
            builder.pathSegment(pathSegment);
        }
        return builder.build().encode().toUriString();
    }

    private String normalizedAppBaseUrl() {
        String configured = properties.getAppBaseUrl();
        if (!StringUtils.hasText(configured)) {
            throw new IllegalStateException("Notification email app base URL is not configured");
        }
        return configured.trim().replaceAll("/+$", "");
    }

    private String resolveLogoUrl() {
        if (StringUtils.hasText(properties.getLogoUrl())) {
            return properties.getLogoUrl().trim();
        }
        return applicationUrl("branding", "portrn-logo.png");
    }

    private String displayName(Profile profile, String fallback) {
        if (profile == null) {
            return fallback;
        }
        if (StringUtils.hasText(profile.getFullName())) {
            return profile.getFullName().trim();
        }
        if (StringUtils.hasText(profile.getUsername())) {
            return profile.getUsername().trim();
        }
        return fallback;
    }

    private String portfolioTitle(Notification notification) {
        if (notification == null) {
            return "your portfolio";
        }

        Portfolio portfolio = notification.getPortfolio();
        if (portfolio != null && StringUtils.hasText(portfolio.getTitle())) {
            return "\"" + portfolio.getTitle().trim() + "\"";
        }
        return "your portfolio";
    }

    private String commentPreview(Notification notification) {
        if (notification == null || notification.getMetadata() == null) {
            return null;
        }

        JsonNode preview = notification.getMetadata().path("commentPreview");
        if (!preview.isTextual() || !StringUtils.hasText(preview.asText())) {
            return null;
        }
        return preview.asText().trim();
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value);
    }

    private record NotificationAction(String label, String url) {
    }
}
