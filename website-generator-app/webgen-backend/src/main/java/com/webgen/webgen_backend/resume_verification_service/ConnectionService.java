package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.connection.*;

import java.util.List;
import java.util.UUID;

public interface ConnectionService {


    /**
     * Return the list of connected accounts for a specific user
     *  - Sort in descending order based on when the accounts were created
     * @param profileId - UUID of the profile to search for connected accounts
     * @return a List of ConnectedAccountDTO's of the given profileID
     */
    List<ConnectedAccountDTO> getConnections(UUID profileId);


    /**
     * Create an instance of connected account to the connected_accounts table
     * @param profileId - UUID of profile that this connected account is linked to
     * @param provider - String of provider that this connected account is connected to
     *                 i.e.) LinkedIn, GitHub, ...
     * @return a ConnectProviderResponseDTO that contains:
     *  - authorization url
     *  - state of connection
     *  - metadata about the connected account
     */
    ConnectProviderResponseDTO connectProvider(UUID profileId, String provider);

    /**
     * Soft delete the row in the database but keep record alive
     *  - Null/Default initializes the schema attributes
     *  - Deletes the connection but keeps row
     * @param profileId - UUID of the profile that belongs to this connected account
     * @param provider - String of provider to disconnect
     * @return a DisconnectProviderResponseDTO that contains:
     *  - an updated version of the ConnectAccountDTO
     */
    DisconnectProviderResponseDTO disconnectProvider(UUID profileId, String provider);
}
