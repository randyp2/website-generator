package com.webgen.webgen_backend.account.dto;

import com.webgen.webgen_backend.account.model.AccountDeletionStage;
import lombok.Builder;
import lombok.Data;

/**
 * Reports durable workflow progress without claiming premature account deletion.
 */
@Data
@Builder
public class AccountDeletionProgressDTO {

    private AccountDeletionStage stage;
    private boolean accountDeleted;
}
