package com.webgen.webgen_backend.profile.dto.social;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ProfileSocialUserDTO {
    private UUID profileId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String jobTitle;
    private String company;
    private String location;
    private OffsetDateTime followedAt;
}
