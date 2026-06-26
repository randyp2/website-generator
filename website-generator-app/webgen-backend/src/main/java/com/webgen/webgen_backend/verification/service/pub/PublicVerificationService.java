package com.webgen.webgen_backend.verification.service.pub;

import com.webgen.webgen_backend.verification.dto.pub.PublicClaimDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicConnectedAccountDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicEvidenceListResponseDTO;
import com.webgen.webgen_backend.verification.dto.pub.PublicVerificationSummaryDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PublicVerificationService {

    /**
     * Fetches verification summary for a public profile route.
     *
     * @param username route handle candidate
     * @return public verification summary when profile exists
     */
    Optional<PublicVerificationSummaryDTO> getSummaryByUsername(String username);

    /**
     * Fetches verification summary for a public profile id.
     *
     * @param profileId stable public owner id
     * @return public verification summary when profile id is valid
     */
    Optional<PublicVerificationSummaryDTO> getSummaryByProfileId(UUID profileId);

    /**
     * Fetches skill claims for a public profile route.
     *
     * @param username route handle candidate
     * @return public skill claims when profile exists
     */
    Optional<List<PublicClaimDTO>> getClaimsByUsername(String username);

    /**
     * Fetches connected account metadata for a public profile route.
     *
     * @param username route handle candidate
     * @return public connected account rows when profile exists
     */
    Optional<List<PublicConnectedAccountDTO>> getConnectionsByUsername(String username);

    /**
     * Fetches evidence rows for a public profile route.
     *
     * @param username route handle candidate
     * @param provider optional provider filter
     * @return public evidence list when profile exists
     */
    Optional<PublicEvidenceListResponseDTO> getEvidenceByUsername(String username, String provider);
}
