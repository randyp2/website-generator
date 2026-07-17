package com.webgen.webgen_backend.account.controller;

import com.webgen.webgen_backend.account.dto.AccountDeletionProgressDTO;
import com.webgen.webgen_backend.account.dto.DeleteAccountRequestDTO;
import com.webgen.webgen_backend.account.service.AccountDeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Authenticated entry point for starting or resuming account deletion.
 */
@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountDeletionController {

    private final AccountDeletionService accountDeletionService;

    @DeleteMapping
    public ResponseEntity<AccountDeletionProgressDTO> deleteMyAccount(
            @RequestBody DeleteAccountRequestDTO request
    ) {
        UUID profileId = UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
        return ResponseEntity.accepted().body(
                accountDeletionService.beginAccountDeletion(profileId, request)
        );
    }
}
