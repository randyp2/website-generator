package com.webgen.webgen_backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PublicProfileDTO {
    private UUID id;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String bannerUrl;
    private String location;
    private String school;
    private String degree;
    private String jobTitle;
    private String company;
    private String websiteUrl;
    private String linkedinUrl;
    private String githubUrl;
}
