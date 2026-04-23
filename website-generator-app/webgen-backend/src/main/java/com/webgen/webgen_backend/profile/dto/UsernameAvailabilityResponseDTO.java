package com.webgen.webgen_backend.profile.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsernameAvailabilityResponseDTO {
    private String username;
    private boolean available;
    private String reason;
}
