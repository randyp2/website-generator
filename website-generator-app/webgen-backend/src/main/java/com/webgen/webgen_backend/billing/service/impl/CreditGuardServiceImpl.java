package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditGuardServiceImpl implements CreditGuardService {

    private static final String REASON_CREDIT_USAGE = "credit_usage";

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Override
    @Transactional
    public void consumeCredits(UUID profileId, int credits, String operationCode) {
        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            return;
        }
        if (credits <= 0) {
            return;
        }
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile id is required");
        }

        Profile profile = profileRepository.findByIdForUpdate(profileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with profile id not found"
                ));

        Integer currentBalance = billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId);
        int availableCredits = currentBalance != null ? currentBalance : 0;

        if (availableCredits < credits) {
            String operationLabel = normalizeOperationLabel(operationCode);
            throw new ResponseStatusException(
                    HttpStatus.PAYMENT_REQUIRED,
                    "Insufficient credits for " + operationLabel
                            + ". Required: " + credits
                            + ", available: " + availableCredits
            );
        }

        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(UUID.randomUUID());
        entry.setProfile(profile);
        entry.setDeltaCredits(-credits);
        entry.setReason(REASON_CREDIT_USAGE);
        entry.setStripeEventId(null);
        entry.setCheckoutSessionId(null);
        entry.setMetadata(buildUsageMetadata(
                operationCode,
                credits,
                availableCredits
        ));
        entry.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        billingCreditLedgerEntryRepository.save(entry);
    }

    private ObjectNode buildUsageMetadata(
            String operationCode,
            int credits,
            int balanceBefore
    ) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("operation_code", normalizeOperationCode(operationCode));
        metadata.put("credits_consumed", credits);
        metadata.put("balance_before", balanceBefore);
        metadata.put("balance_after", balanceBefore - credits);
        return metadata;
    }

    private String normalizeOperationCode(String operationCode) {
        if (operationCode == null || operationCode.isBlank()) {
            return "unspecified";
        }
        return operationCode.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    private String normalizeOperationLabel(String operationCode) {
        if (operationCode == null || operationCode.isBlank()) {
            return "this operation";
        }
        return operationCode.trim().replace('_', ' ');
    }
}
