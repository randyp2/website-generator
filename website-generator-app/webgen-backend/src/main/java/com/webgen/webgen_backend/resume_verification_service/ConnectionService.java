package com.webgen.webgen_backend.resume_verification_service;

import com.webgen.webgen_backend.dto.profile.verification.connection.ConnectedAccountDTO;

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


    

}
