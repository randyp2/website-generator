package com.webgen.webgen_backend.account.entity;

import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Durable workflow state that remains after the user's profile is removed.
 */
@Entity
@Table(name = "account_deletion_requests", schema = "public")
@NoArgsConstructor
@Getter
@Setter
public class AccountDeletionRequest {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private AccountDeletionStage stage;

    @Column(name = "stripe_customer_deleted_at")
    private OffsetDateTime stripeCustomerDeletedAt;

    @Column(name = "object_storage_deleted_at")
    private OffsetDateTime objectStorageDeletedAt;

    @Column(name = "application_data_deleted_at")
    private OffsetDateTime applicationDataDeletedAt;

    @Column(name = "auth_user_deleted_at")
    private OffsetDateTime authUserDeletedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
