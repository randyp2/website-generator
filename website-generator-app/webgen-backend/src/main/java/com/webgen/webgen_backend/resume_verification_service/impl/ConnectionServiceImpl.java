package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;
import com.webgen.webgen_backend.entity.ConnectedAccount;
import com.webgen.webgen_backend.repository.ConnectedAccountRepository;
import com.webgen.webgen_backend.resume_verification_service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectedAccountRepository connectedAccountRepository;

    @Override
    public List<ConnectedAccountDTO> getConnections(UUID profileId) {
        return connectedAccountRepository.findByProfileIdOrderByCreatedAtDesc(profileId).stream()
                .map(this::toDto)
                .toList();
    }

    private ConnectedAccountDTO toDto(ConnectedAccount account) {
        return ConnectedAccountDTO.builder()
                .id(account.getId())
                .profileId(account.getProfile().getId())
                .provider(account.getProvider())
                .providerUserId(account.getProviderUserId())
                .status(account.getStatus())
                .scopes(account.getScopes() == null ? List.of() : Arrays.asList(account.getScopes()))
                .lastSyncedAt(account.getLastSyncedAt())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
