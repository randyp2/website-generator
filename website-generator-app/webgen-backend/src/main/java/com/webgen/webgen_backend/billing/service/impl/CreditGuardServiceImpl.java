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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditGuardServiceImpl implements CreditGuardService {

    private static final String REASON_CREDIT_RESERVATION = "credit_reservation";
    private static final String REASON_CREDIT_REFUND = "credit_refund";
    private static final String REASON_LEGACY_CREDIT_USAGE = "credit_usage";
    private static final int MAX_FAILURE_REASON_LENGTH = 500;

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Override
    @Transactional
    public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            return Optional.empty();
        }
        if (credits <= 0) {
            return Optional.empty();
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

        UUID reservationId = UUID.randomUUID();
        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(reservationId);
        entry.setProfile(profile);
        entry.setDeltaCredits(-credits);
        entry.setReason(REASON_CREDIT_RESERVATION);
        entry.setStripeEventId(null);
        entry.setCheckoutSessionId(null);
        entry.setCreditOperationId(reservationId);
        entry.setMetadata(buildReservationMetadata(
                operationCode,
                credits,
                availableCredits
        ));
        entry.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        billingCreditLedgerEntryRepository.save(entry);
        return Optional.of(reservationId);
    }

    @Override
    @Transactional
    public void refundCredits(UUID reservationId, String failureReason) {
        if (reservationId == null) {
            return;
        }

        BillingCreditLedgerEntry reservation = billingCreditLedgerEntryRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Credit reservation not found: " + reservationId
                ));

        if (!isRefundableReservation(reservation)
                || reservation.getDeltaCredits() == null
                || reservation.getDeltaCredits() >= 0) {
            throw new IllegalArgumentException("Ledger entry is not a credit reservation: " + reservationId);
        }

        UUID profileId = reservation.getProfile().getId();
        Profile profile = profileRepository.findByIdForUpdate(profileId)
                .orElseThrow(() -> new IllegalStateException(
                        "Profile for credit reservation not found: " + profileId
                ));

        if (billingCreditLedgerEntryRepository.existsByCreditOperationIdAndReason(
                reservationId,
                REASON_CREDIT_REFUND
        )) {
            return;
        }

        Integer currentBalance = billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId);
        int availableCredits = currentBalance != null ? currentBalance : 0;
        int refundedCredits = Math.negateExact(reservation.getDeltaCredits());

        BillingCreditLedgerEntry refund = new BillingCreditLedgerEntry();
        refund.setId(UUID.randomUUID());
        refund.setProfile(profile);
        refund.setDeltaCredits(refundedCredits);
        refund.setReason(REASON_CREDIT_REFUND);
        refund.setStripeEventId(null);
        refund.setCheckoutSessionId(null);
        refund.setCreditOperationId(reservationId);
        refund.setMetadata(buildRefundMetadata(
                reservation,
                failureReason,
                refundedCredits,
                availableCredits
        ));
        refund.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        billingCreditLedgerEntryRepository.save(refund);
    }

    private boolean isRefundableReservation(BillingCreditLedgerEntry entry) {
        return REASON_CREDIT_RESERVATION.equals(entry.getReason())
                || REASON_LEGACY_CREDIT_USAGE.equals(entry.getReason());
    }

    private ObjectNode buildReservationMetadata(
            String operationCode,
            int credits,
            int balanceBefore
    ) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("operation_code", normalizeOperationCode(operationCode));
        metadata.put("credits_reserved", credits);
        metadata.put("balance_before", balanceBefore);
        metadata.put("balance_after", balanceBefore - credits);
        return metadata;
    }

    private ObjectNode buildRefundMetadata(
            BillingCreditLedgerEntry reservation,
            String failureReason,
            int refundedCredits,
            int balanceBefore
    ) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("reservation_id", reservation.getId().toString());
        metadata.put("failure_reason", normalizeFailureReason(failureReason));
        metadata.put("credits_refunded", refundedCredits);
        metadata.put("balance_before", balanceBefore);
        metadata.put("balance_after", balanceBefore + refundedCredits);

        if (reservation.getMetadata() != null
                && reservation.getMetadata().path("operation_code").isTextual()) {
            metadata.put(
                    "operation_code",
                    reservation.getMetadata().path("operation_code").asText()
            );
        }
        return metadata;
    }

    private String normalizeFailureReason(String failureReason) {
        String normalized = failureReason == null || failureReason.isBlank()
                ? "unspecified_failure"
                : failureReason.trim();
        return normalized.length() <= MAX_FAILURE_REASON_LENGTH
                ? normalized
                : normalized.substring(0, MAX_FAILURE_REASON_LENGTH);
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
