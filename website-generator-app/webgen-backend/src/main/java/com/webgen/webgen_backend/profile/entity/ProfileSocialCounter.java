package com.webgen.webgen_backend.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "profile_social_counters", schema = "public")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ProfileSocialCounter {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "followers_count", nullable = false)
    private Integer followersCount;

    @Column(name = "following_count", nullable = false)
    private Integer followingCount;

    @Column(name = "profile_views_count", nullable = false)
    private Integer profileViewsCount;

    @Column(name = "portfolio_likes_count", nullable = false)
    private Integer portfolioLikesCount;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
