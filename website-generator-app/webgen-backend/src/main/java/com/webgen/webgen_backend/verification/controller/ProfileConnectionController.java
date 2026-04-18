package com.webgen.webgen_backend.verification.controller;

import com.webgen.webgen_backend.verification.dto.connection.ConnectProviderResponseDTO;
import com.webgen.webgen_backend.verification.dto.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.connection.DisconnectProviderResponseDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackRequestDTO;
import com.webgen.webgen_backend.verification.dto.connection.ProviderCallbackResponseDTO;
import com.webgen.webgen_backend.verification.dto.connection.SyncProviderResponseDTO;
import com.webgen.webgen_backend.verification.service.ConnectionService;
import com.webgen.webgen_backend.verification.service.ConnectionSyncService;
import com.webgen.webgen_backend.verification.service.ProviderOAuthCallbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/resume-verification/connections")
@RequiredArgsConstructor
public class ProfileConnectionController {

    private final ConnectionService connectionService;
    private final ConnectionSyncService connectionSyncService;
    private final ProviderOAuthCallbackService providerOAuthCallbackService;

    @GetMapping
    public ResponseEntity<List<ConnectedAccountDTO>> getConnections() {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(connectionService.getConnections(userId));
    }

    @PostMapping("/{provider}/connect")
    public ResponseEntity<ConnectProviderResponseDTO> connectProvider(
            @PathVariable String provider
    ) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(connectionService.connectProvider(userId, provider));
    }

    @DeleteMapping("/{provider}")
    public ResponseEntity<DisconnectProviderResponseDTO> disconnectProvider(
            @PathVariable String provider
    ) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(connectionService.disconnectProvider(userId, provider));
    }

    @PostMapping("/{provider}/sync")
    public ResponseEntity<SyncProviderResponseDTO> syncProvider(
            @PathVariable String provider
    ) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(connectionSyncService.syncProvider(userId, provider));
    }

    @PostMapping("/{provider}/callback")
    public ResponseEntity<ProviderCallbackResponseDTO> handleProviderCallback(
            @PathVariable String provider,
            @RequestBody ProviderCallbackRequestDTO req
    ) {
        UUID userId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(
                providerOAuthCallbackService.handleProviderCallback(userId, provider, req)
        );
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
