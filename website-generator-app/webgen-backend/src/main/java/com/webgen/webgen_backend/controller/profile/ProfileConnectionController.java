package com.webgen.webgen_backend.controller.profile;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectProviderResponseDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.dto.profile.verification.connection.DisconnectProviderResponseDTO;
import com.webgen.webgen_backend.resume_verification_service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
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

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
