package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.profile.dto.ProfileBillingDTO;

import java.util.UUID;

public interface BillingStatusReader {

    /**
     * Builds the user-facing billing snapshot for the given profile.
     * Returns null when the profile has no billing footprint (no active sub and zero credits).
     */
    ProfileBillingDTO read(UUID profileId);
}
