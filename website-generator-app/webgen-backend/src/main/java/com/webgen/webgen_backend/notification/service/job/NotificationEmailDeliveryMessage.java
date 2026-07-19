package com.webgen.webgen_backend.notification.service.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEmailDeliveryMessage {
    private UUID deliveryId;
}
