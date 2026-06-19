package com.webgen.webgen_backend.portfolio.entity;

import com.webgen.webgen_backend.profile.entity.Profile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "portfolio_likes",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "portfolio_likes_portfolio_profile_key",
                        columnNames = {"portfolio_id", "profile_id"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class PortfolioLike {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
