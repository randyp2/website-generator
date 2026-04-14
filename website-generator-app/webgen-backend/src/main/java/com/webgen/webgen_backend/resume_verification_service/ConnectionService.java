package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;

import java.util.List;
import java.util.UUID;

public interface ConnectionService {
    List<ConnectedAccountDTO> getConnections(UUID profileId);
}
