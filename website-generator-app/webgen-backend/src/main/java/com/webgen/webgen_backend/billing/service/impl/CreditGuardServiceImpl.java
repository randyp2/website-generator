package com.webgen.webgen_backend.billing.service.impl;

import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditGuardServiceImpl implements CreditGuardService {

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final Environment environment;

    @Override
    public void assertHasRequiredCredits(UUID profileId, int requiredCredits, String operationCode) {
        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            return;
        }
        if (requiredCredits <= 0) {
            return;
        }
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile id is required");
        }

        Integer currentBalance = billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId);
        int availableCredits = currentBalance != null ? currentBalance : 0;

        if (availableCredits < requiredCredits) {
            String normalizedOperation = normalizeOperationCode(operationCode);
            throw new ResponseStatusException(
                    HttpStatus.PAYMENT_REQUIRED,
                    "Insufficient credits for " + normalizedOperation
                            + ". Required: " + requiredCredits
                            + ", available: " + availableCredits
            );
        }
    }

    private String normalizeOperationCode(String operationCode) {
        if (operationCode == null || operationCode.isBlank()) {
            return "this operation";
        }
        return operationCode.trim().replace('_', ' ');
    }
}
