package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.billing.entity.BillingCreditLedgerEntry;
import com.webgen.webgen_backend.billing.model.CreditBucket;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.repository.BillingCreditLedgerEntryRepository;
import com.webgen.webgen_backend.billing.service.BillingAllowanceGrantService;
import com.webgen.webgen_backend.billing.service.BillingEntitlementGrantService;
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
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditGuardServiceImpl implements CreditGuardService {

    private static final String REASON_CREDIT_RESERVATION = "credit_reservation";
    private static final String REASON_CREDIT_REFUND = "credit_refund";
    private static final String REASON_ALLOWANCE_RESERVATION = "allowance_reservation";
    private static final String REASON_ALLOWANCE_REFUND = "allowance_refund";
    private static final String REASON_LEGACY_CREDIT_USAGE = "credit_usage";
    private static final int MAX_FAILURE_REASON_LENGTH = 500;

    private final BillingCreditLedgerEntryRepository billingCreditLedgerEntryRepository;
    private final ProfileRepository profileRepository;
    private final BillingEntitlementGrantService billingEntitlementGrantService;
    private final BillingAllowanceGrantService billingAllowanceGrantService;
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

        Profile profile = lockProfile(profileId);
        UUID reservationId = reserveGeneralCredits(
                profile,
                credits,
                operationCode,
                OffsetDateTime.now(ZoneOffset.UTC)
        );
        return Optional.of(reservationId);
    }

    @Override
    @Transactional
    public Optional<UUID> reserveUsage(UUID profileId, CreditUsagePolicy policy) {
        if (policy == null) {
            throw new IllegalArgumentException("Credit usage policy is required");
        }
        return reserveUsage(
                profileId,
                policy.allowanceBucket(),
                policy.fallbackCredits(),
                policy.operationCode()
        );
    }

    @Override
    @Transactional
    public Optional<UUID> reserveUsage(
            UUID profileId,
            CreditBucket allowanceBucket,
            int fallbackCredits,
            String operationCode
    ) {
        if (environment.acceptsProfiles(Profiles.of("dev"))) {
            return Optional.empty();
        }
        validateUsageRequest(profileId, allowanceBucket, fallbackCredits);

        OffsetDateTime reservationTime = OffsetDateTime.now(ZoneOffset.UTC);
        billingEntitlementGrantService.ensureCurrentEntitlements(profileId, reservationTime);
        billingAllowanceGrantService.ensureCurrentSubscriptionAllowances(
                profileId,
                reservationTime
        );
        Profile profile = lockProfile(profileId);
        Optional<UUID> allowanceReservation = reserveActiveAllowance(
                profile,
                allowanceBucket,
                operationCode,
                reservationTime
        );
        if (allowanceReservation.isPresent()) {
            return allowanceReservation;
        }

        UUID reservationId = reserveGeneralCredits(
                profile,
                fallbackCredits,
                operationCode,
                reservationTime
        );
        return Optional.of(reservationId);
    }

    private Profile lockProfile(UUID profileId) {
        return profileRepository.findByIdForUpdate(profileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with profile id not found"
                ));
    }

    private Optional<UUID> reserveActiveAllowance(
            Profile profile,
            CreditBucket allowanceBucket,
            String operationCode,
            OffsetDateTime reservationTime
    ) {
        List<BillingCreditLedgerEntry> grants =
                billingCreditLedgerEntryRepository.findActiveAllowanceGrantsForUpdate(
                        profile.getId(),
                        allowanceBucket,
                        reservationTime
                );

        for (BillingCreditLedgerEntry grant : grants) {
            int availableUnits = balanceOrZero(
                    billingCreditLedgerEntryRepository.computeRemainingUnitsByGrantEntryId(
                            grant.getId()
                    )
            );
            if (availableUnits <= 0) {
                continue;
            }

            UUID reservationId = appendReservation(
                    profile,
                    -1,
                    REASON_ALLOWANCE_RESERVATION,
                    allowanceBucket,
                    grant,
                    buildAllowanceReservationMetadata(
                            operationCode,
                            allowanceBucket,
                            grant,
                            availableUnits
                    ),
                    reservationTime
            );
            return Optional.of(reservationId);
        }

        return Optional.empty();
    }

    private UUID reserveGeneralCredits(
            Profile profile,
            int credits,
            String operationCode,
            OffsetDateTime reservationTime
    ) {
        int availableCredits = balanceOrZero(
                billingCreditLedgerEntryRepository.computeBalanceByProfileId(profile.getId())
        );
        if (availableCredits < credits) {
            throw insufficientCredits(operationCode, credits, availableCredits);
        }

        return appendReservation(
                profile,
                -credits,
                REASON_CREDIT_RESERVATION,
                CreditBucket.GENERAL,
                null,
                buildCreditReservationMetadata(operationCode, credits, availableCredits),
                reservationTime
        );
    }

    private UUID appendReservation(
            Profile profile,
            int deltaUnits,
            String reason,
            CreditBucket creditBucket,
            BillingCreditLedgerEntry grant,
            ObjectNode metadata,
            OffsetDateTime reservationTime
    ) {
        UUID reservationId = UUID.randomUUID();
        BillingCreditLedgerEntry entry = new BillingCreditLedgerEntry();
        entry.setId(reservationId);
        entry.setProfile(profile);
        entry.setDeltaCredits(deltaUnits);
        entry.setReason(reason);
        entry.setStripeEventId(null);
        entry.setCheckoutSessionId(null);
        entry.setCreditOperationId(reservationId);
        entry.setCreditBucket(creditBucket);
        entry.setGrantEntry(grant);
        entry.setMetadata(metadata);
        entry.setCreatedAt(reservationTime);

        billingCreditLedgerEntryRepository.save(entry);
        return reservationId;
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

        String refundReason = refundReasonFor(reservation);
        if (billingCreditLedgerEntryRepository.existsByCreditOperationIdAndReason(
                reservationId,
                refundReason
        )) {
            return;
        }

        int balanceBefore = balanceBeforeRefund(reservation, profileId);
        int refundedUnits = Math.negateExact(reservation.getDeltaCredits());

        BillingCreditLedgerEntry refund = new BillingCreditLedgerEntry();
        refund.setId(UUID.randomUUID());
        refund.setProfile(profile);
        refund.setDeltaCredits(refundedUnits);
        refund.setReason(refundReason);
        refund.setStripeEventId(null);
        refund.setCheckoutSessionId(null);
        refund.setCreditOperationId(reservationId);
        refund.setCreditBucket(reservation.getCreditBucket());
        refund.setGrantEntry(reservation.getGrantEntry());
        refund.setMetadata(buildRefundMetadata(
                reservation,
                failureReason,
                refundedUnits,
                balanceBefore
        ));
        refund.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        billingCreditLedgerEntryRepository.save(refund);
    }

    private boolean isRefundableReservation(BillingCreditLedgerEntry entry) {
        return REASON_CREDIT_RESERVATION.equals(entry.getReason())
                || REASON_ALLOWANCE_RESERVATION.equals(entry.getReason())
                || REASON_LEGACY_CREDIT_USAGE.equals(entry.getReason());
    }

    private String refundReasonFor(BillingCreditLedgerEntry reservation) {
        if (REASON_ALLOWANCE_RESERVATION.equals(reservation.getReason())) {
            if (reservation.getGrantEntry() == null
                    || reservation.getCreditBucket() == CreditBucket.GENERAL) {
                throw new IllegalArgumentException(
                        "Allowance reservation is missing its scoped grant: " + reservation.getId()
                );
            }
            return REASON_ALLOWANCE_REFUND;
        }
        return REASON_CREDIT_REFUND;
    }

    private int balanceBeforeRefund(BillingCreditLedgerEntry reservation, UUID profileId) {
        if (REASON_ALLOWANCE_RESERVATION.equals(reservation.getReason())) {
            return balanceOrZero(
                    billingCreditLedgerEntryRepository.computeRemainingUnitsByGrantEntryId(
                            reservation.getGrantEntry().getId()
                    )
            );
        }
        return balanceOrZero(
                billingCreditLedgerEntryRepository.computeBalanceByProfileId(profileId)
        );
    }

    private ObjectNode buildCreditReservationMetadata(
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

    private ObjectNode buildAllowanceReservationMetadata(
            String operationCode,
            CreditBucket allowanceBucket,
            BillingCreditLedgerEntry grant,
            int balanceBefore
    ) {
        ObjectNode metadata = objectMapper.createObjectNode();
        metadata.put("operation_code", normalizeOperationCode(operationCode));
        metadata.put("credit_bucket", allowanceBucket.databaseValue());
        metadata.put("grant_entry_id", grant.getId().toString());
        metadata.put("allowance_units_reserved", 1);
        metadata.put("balance_before", balanceBefore);
        metadata.put("balance_after", balanceBefore - 1);
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
        metadata.put("credit_bucket", reservation.getCreditBucket().databaseValue());
        metadata.put("balance_before", balanceBefore);
        metadata.put("balance_after", balanceBefore + refundedCredits);

        if (REASON_ALLOWANCE_RESERVATION.equals(reservation.getReason())) {
            metadata.put("allowance_units_refunded", refundedCredits);
            metadata.put("grant_entry_id", reservation.getGrantEntry().getId().toString());
        } else {
            metadata.put("credits_refunded", refundedCredits);
        }

        if (reservation.getMetadata() != null
                && reservation.getMetadata().path("operation_code").isTextual()) {
            metadata.put(
                    "operation_code",
                    reservation.getMetadata().path("operation_code").asText()
            );
        }
        return metadata;
    }

    private void validateUsageRequest(
            UUID profileId,
            CreditBucket allowanceBucket,
            int fallbackCredits
    ) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile id is required");
        }
        if (allowanceBucket == null || allowanceBucket == CreditBucket.GENERAL) {
            throw new IllegalArgumentException("A scoped allowance bucket is required");
        }
        if (fallbackCredits <= 0) {
            throw new IllegalArgumentException("Fallback credits must be positive");
        }
    }

    private int balanceOrZero(Integer balance) {
        return balance != null ? balance : 0;
    }

    private ResponseStatusException insufficientCredits(
            String operationCode,
            int requiredCredits,
            int availableCredits
    ) {
        String operationLabel = normalizeOperationLabel(operationCode);
        return new ResponseStatusException(
                HttpStatus.PAYMENT_REQUIRED,
                "Insufficient credits for " + operationLabel
                        + ". Required: " + requiredCredits
                        + ", available: " + availableCredits
        );
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
