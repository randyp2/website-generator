package com.webgen.webgen_backend.verification.service;

import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadDownloadUrlResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.ClaimEvidenceUploadListResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.CreateClaimEvidenceUploadPresignResponseDTO;
import com.webgen.webgen_backend.verification.dto.evidence.FinalizeClaimEvidenceUploadRequestDTO;
import com.webgen.webgen_backend.verification.dto.evidence.FinalizeClaimEvidenceUploadResponseDTO;

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
    FinalizeClaimEvidenceUploadResponseDTO finalizeUpload(
            UUID profileId,
            UUID claimId,
            FinalizeClaimEvidenceUploadRequestDTO request
    );

    /**
     * Deletes one upload for a claim by removing the stored object and deleting
     * its corresponding claim evidence upload row.
     *
     * @param profileId authenticated profile id
     * @param claimId claim id that owns the upload
     * @param uploadId upload id to delete
     */
    void deleteUpload(
            UUID profileId,
            UUID claimId,
            UUID uploadId
    );

    /**
     * Generates a short-lived pre-signed download URL for one upload owned by
     * the authenticated profile and scoped to the claim.
     *
     * @param profileId authenticated profile id
     * @param claimId claim id that owns the upload
     * @param uploadId upload id to download
     * @return download URL payload with expiry metadata
     */
    ClaimEvidenceUploadDownloadUrlResponseDTO createDownloadUrl(
            UUID profileId,
            UUID claimId,
            UUID uploadId
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
