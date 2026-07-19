package com.webgen.webgen_backend.portfolio.entity;

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
@Table(name = "portfolio_engagement_counters", schema = "public")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class PortfolioEngagementCounter {

    @Id
    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "likes_count", nullable = false)
    private Integer likesCount;

    @Column(name = "comments_count", nullable = false)
    private Integer commentsCount;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount;

    @Column(name = "shares_count", nullable = false)
    private Integer sharesCount;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
