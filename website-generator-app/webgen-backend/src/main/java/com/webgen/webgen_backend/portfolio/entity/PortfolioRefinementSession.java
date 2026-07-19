package com.webgen.webgen_backend.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Durable workflow state linking one portfolio refinement to one billing reservation. */
@Entity
@Table(name = "portfolio_refinement_sessions", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class PortfolioRefinementSession {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "profile_id", nullable = false, updatable = false)
    private UUID profileId;

    @Column(name = "portfolio_id", nullable = false, updatable = false)
    private UUID portfolioId;

    @Column(name = "usage_reservation_id", updatable = false)
    private UUID usageReservationId;

    @Column(name = "ai_turn_count", nullable = false)
    private int aiTurnCount;

    @Column(name = "has_successful_response", nullable = false)
    private boolean hasSuccessfulResponse;

    @Column(name = "plan_completed", nullable = false)
    private boolean planCompleted;

    @Column(name = "turn_in_progress", nullable = false)
    private boolean turnInProgress;

    @Column(name = "build_started", nullable = false)
    private boolean buildStarted;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
