package com.webgen.webgen_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "connected_accounts", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class ConnectedAccount {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    @Column(name = "status", nullable = false)
    private String status;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "scopes", nullable = false, columnDefinition = "text[]")
    private String[] scopes;

    @Column(name = "access_token_encrypted")
    private String accessTokenEncrypted;

    @Column(name = "refresh_token_encrypted")
    private String refreshTokenEncrypted;

    @Column(name = "access_token_expires_at")
    private OffsetDateTime accessTokenExpiresAt;

    @Column(name = "refresh_token_expires_at")
    private OffsetDateTime refreshTokenExpiresAt;

    @Column(name = "oauth_state")
    private String oauthState;

    @Column(name = "oauth_state_expires_at")
    private OffsetDateTime oauthStateExpiresAt;

    @Column(name = "last_synced_at")
    private OffsetDateTime lastSyncedAt;

    @Column(name = "last_sync_status", nullable = false)
    private String lastSyncStatus;

    @Column(name = "last_sync_error")
    private String lastSyncError;

    @Column(name = "last_sync_started_at")
    private OffsetDateTime lastSyncStartedAt;

    @Column(name = "last_sync_completed_at")
    private OffsetDateTime lastSyncCompletedAt;

    @Column(name = "last_sync_imported_count", nullable = false)
    private Integer lastSyncImportedCount;

    @Column(name = "last_sync_linked_count", nullable = false)
    private Integer lastSyncLinkedCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
