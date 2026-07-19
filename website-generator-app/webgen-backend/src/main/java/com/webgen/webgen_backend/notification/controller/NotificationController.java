package com.webgen.webgen_backend.notification.controller;

import com.webgen.webgen_backend.notification.dto.NotificationDTO;
import com.webgen.webgen_backend.notification.dto.NotificationListResponseDTO;
import com.webgen.webgen_backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationListResponseDTO> listNotifications(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.listNotifications(profileId, page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(profileId)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markRead(
            @PathVariable UUID notificationId) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.markRead(profileId, notificationId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead() {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(Map.of("updatedCount", notificationService.markAllRead(profileId)));
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
