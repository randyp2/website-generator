package com.webgen.webgen_backend.billing.service;

import com.webgen.webgen_backend.profile.dto.ProfileBillingDTO;

import java.util.UUID;

public interface BillingStatusReader {

    /**
     * Builds the user-facing billing snapshot for the given profile.
     * Materializes the current subscription allowance window when needed.
     * Returns null when the profile has no plan, credits, or active allowances.
     */
    ProfileBillingDTO read(UUID profileId);
}
