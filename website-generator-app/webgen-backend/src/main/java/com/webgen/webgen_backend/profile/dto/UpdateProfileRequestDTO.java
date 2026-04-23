package com.webgen.webgen_backend.profile.dto;

import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
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
