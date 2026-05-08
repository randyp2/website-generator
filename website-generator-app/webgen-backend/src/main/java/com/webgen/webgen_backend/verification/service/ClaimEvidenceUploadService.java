package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadListResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.FinalizeClaimEvidenceUploadRequestDTO;

import java.util.UUID;

public interface ClaimEvidenceUploadService {

    /**
     * Creates a staged claim evidence upload row and returns a pre-signed PUT URL.
     * The created upload is initialized in {@code uploaded} status.
     *
     * @param profileId authenticated profile id that owns the claim
     * @param claimId claim id the evidence belongs to
     * @param request upload metadata used to build object key and signed request
     * @return signed upload payload including bucket/key and required headers
     */
    CreateClaimEvidenceUploadPresignResponseDTO createUploadPresign(
            UUID profileId,
            UUID claimId,
            CreateClaimEvidenceUploadPresignRequestDTO request
    );

    /**
     * Finalizes an upload after client PUT succeeds by validating object presence
     * and transitioning the upload lifecycle status to {@code completed}.
     *
     * @param profileId authenticated profile id that owns the claim
     * @param claimId claim id the upload belongs to
     * @param request finalize payload containing upload id and optional metadata
     * @return updated upload DTO after status transition
     */
    ClaimEvidenceUploadDTO finalizeUpload(
            UUID profileId,
            UUID claimId,
            FinalizeClaimEvidenceUploadRequestDTO request
    );

    /**
     * Lists all evidence uploads for one claim in descending creation order.
     *
     * @param profileId authenticated profile id
     * @param claimId claim id to list uploads for
     * @return upload list payload with cursor placeholder for future pagination
     */
    ClaimEvidenceUploadListResponseDTO listClaimUploads(
            UUID profileId,
            UUID claimId
    );
}
