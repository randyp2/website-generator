package com.webgen.webgen_backend.portfolio.entity;

import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationMethod;
import com.webgen.webgen_backend.portfolio.model.verification.SiteVerificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Stores a one-time challenge used to prove control of an external website.
 */
@Entity
@Table(
        name = "site_ownership_verifications",
        schema = "public",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "site_ownership_verifications_user_url_method_key",
                        columnNames = {"user_id", "verification_url", "method"}
                ),
                @UniqueConstraint(
                        name = "site_ownership_verifications_challenge_token_key",
                        columnNames = "challenge_token"
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SiteOwnershipVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "verification_url", nullable = false, length = 2048)
    private String verificationUrl;

    @Column(name = "canonical_origin", nullable = false, length = 512)
    private String canonicalOrigin;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 32)
    @Builder.Default
    private SiteVerificationMethod method = SiteVerificationMethod.HTML_META;

    @Column(name = "challenge_token", nullable = false, length = 128)
    private String challengeToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private SiteVerificationStatus status = SiteVerificationStatus.PENDING;

    @Column(name = "challenge_expires_at", nullable = false)
    private OffsetDateTime challengeExpiresAt;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
