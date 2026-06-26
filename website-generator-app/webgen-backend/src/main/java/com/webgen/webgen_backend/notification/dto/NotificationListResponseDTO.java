package com.webgen.webgen_backend.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NotificationListResponseDTO {
    private List<NotificationDTO> notifications;
}
