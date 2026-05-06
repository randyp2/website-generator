package com.webgen.webgen_backend.billing.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.billing.dto.BillingInvoiceDTO;
import com.webgen.webgen_backend.billing.entity.BillingInvoice;
import com.webgen.webgen_backend.billing.mapper.BillingInvoiceMapper;
import com.webgen.webgen_backend.billing.model.webhook.StripeInvoiceSnapshotModel;
import com.webgen.webgen_backend.billing.repository.BillingInvoiceRepository;
import com.webgen.webgen_backend.billing.service.BillingInvoiceService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingInvoiceServiceImpl implements BillingInvoiceService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final BillingInvoiceRepository billingInvoiceRepository;
    private final ProfileRepository profileRepository;
    private final BillingInvoiceMapper billingInvoiceMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void syncInvoiceSnapshot(StripeInvoiceSnapshotModel snapshot) {
        if (snapshot == null) {
            return;
        }

        String stripeInvoiceId = requireText(
                snapshot.getInvoiceId(),
                "Stripe invoice id is required for invoice sync"
        );
        String stripeCustomerId = requireText(
                snapshot.getStripeCustomerId(),
                "Stripe customer id is required for invoice sync"
        );
        String eventType = requireText(
                snapshot.getEventType() != null ? snapshot.getEventType().value() : null,
                "Stripe invoice event type is required for invoice sync"
        );

        Profile profile = resolveProfile(snapshot.getProfileId(), stripeCustomerId);
        OffsetDateTime now = nowUtc();
        OffsetDateTime occurredAt = snapshot.getOccurredAt() != null ? snapshot.getOccurredAt() : now;

        billingInvoiceRepository.upsertByStripeInvoiceId(
                UUID.randomUUID(),
                profile.getId(),
                stripeInvoiceId,
                stripeCustomerId,
                nullableTrim(snapshot.getStripeSubscriptionId()),
                eventType,
                nullableTrim(snapshot.getStatus()),
                snapshot.getAmountPaid(),
                snapshot.getAmountDue(),
                nullableLower(snapshot.getCurrency()),
                nullableTrim(snapshot.getBillingReason()),
                nullableTrim(snapshot.getPlanKey()),
                nullableTrim(snapshot.getPriceId()),
                nullableTrim(snapshot.getHostedInvoiceUrl()),
                nullableTrim(snapshot.getInvoicePdfUrl()),
                snapshot.getCurrentPeriodStart(),
                snapshot.getCurrentPeriodEnd(),
                metadataJson(objectOrEmpty(snapshot.getMetadata())),
                occurredAt,
                occurredAt,
                now
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillingInvoiceDTO> listRecentInvoices(UUID profileId, Integer limit) {
        if (profileId == null) {
            return List.of();
        }

        int normalizedLimit = normalizeLimit(limit);
        List<BillingInvoice> rows = billingInvoiceRepository.findByProfile_IdOrderByOccurredAtDescUpdatedAtDesc(
                profileId,
                PageRequest.of(0, normalizedLimit)
        );

        return billingInvoiceMapper.toDtos(rows);
    }

    private Profile resolveProfile(UUID profileId, String stripeCustomerId) {
        if (profileId != null) {
            return profileRepository.findById(profileId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Profile with profile id not found"
                    ));
        }

        return profileRepository.findByStripeCustomerId(stripeCustomerId.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile with stripe customer id not found"
                ));
    }

    private JsonNode objectOrEmpty(JsonNode candidate) {
        if (candidate != null && candidate.isObject()) {
            return candidate;
        }
        return objectMapper.createObjectNode();
    }

    private String metadataJson(JsonNode metadata) {
        try {
            return objectMapper.writeValueAsString(objectOrEmpty(metadata));
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to serialize invoice metadata",
                    exception
            );
        }
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String nullableTrim(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String nullableLower(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private OffsetDateTime nowUtc() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
