package com.webgen.webgen_backend.verification.service;

import java.util.Collection;
import java.util.UUID;

/** Recomputes persisted claim workflow states from active evidence. */
public interface ClaimVerificationStatusService {

    void reconcileClaims(UUID profileId, Collection<UUID> claimIds);

    void reconcileProfile(UUID profileId);
}
