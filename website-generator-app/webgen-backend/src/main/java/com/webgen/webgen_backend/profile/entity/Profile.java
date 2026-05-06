package com.webgen.webgen_backend.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "profiles", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class Profile {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "username")
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "bio")
    private String bio;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "location")
    private String location;

    @Column(name = "school")
    private String school;

    @Column(name = "degree")
    private String degree;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company")
    private String company;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "onboarding_complete", nullable = false)
    private Boolean onboardingComplete;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;
}
