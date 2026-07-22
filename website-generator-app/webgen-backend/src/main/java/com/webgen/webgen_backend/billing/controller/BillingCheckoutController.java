package com.webgen.webgen_backend.billing.controller;

import com.webgen.webgen_backend.billing.dto.BillingCreditPurchaseDTO;
import com.webgen.webgen_backend.billing.dto.BillingInvoiceDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionRequestDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;
import com.webgen.webgen_backend.billing.dto.CreatePortalSessionResponseDTO;
import com.webgen.webgen_backend.billing.service.BillingCheckoutService;
import com.webgen.webgen_backend.billing.service.BillingCreditLedgerService;
import com.webgen.webgen_backend.billing.service.BillingInvoiceService;
import com.webgen.webgen_backend.shared.ratelimit.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingCheckoutController {

    private static final String CHECKOUT_RATE_LIMIT_POLICY = "billing-checkout";
    private static final String PORTAL_RATE_LIMIT_POLICY = "billing-portal";

    private final BillingCheckoutService billingCheckoutService;
    private final BillingInvoiceService billingInvoiceService;
    private final BillingCreditLedgerService billingCreditLedgerService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/checkout/session")
    public ResponseEntity<CreateCheckoutSessionResponseDTO> createCheckoutSession(
            @RequestBody CreateCheckoutSessionRequestDTO request
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        rateLimiterService.check(CHECKOUT_RATE_LIMIT_POLICY, profileId.toString());
        return ResponseEntity.ok(
                billingCheckoutService.createCheckoutSession(profileId, request)
        );
    }

    @PostMapping("/portal/session")
    public ResponseEntity<CreatePortalSessionResponseDTO> createPortalSession() {
        UUID profileId = resolveAuthenticatedUserId();
        rateLimiterService.check(PORTAL_RATE_LIMIT_POLICY, profileId.toString());
        return ResponseEntity.ok(
                billingCheckoutService.createPortalSession(profileId)
        );
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<BillingInvoiceDTO>> listMyInvoices(
            @RequestParam(required = false) Integer limit
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(
                billingInvoiceService.listRecentInvoices(profileId, limit)
        );
    }

    @GetMapping("/credit-purchases")
    public ResponseEntity<List<BillingCreditPurchaseDTO>> listMyCreditPurchases(
            @RequestParam(required = false) Integer limit
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(
                billingCreditLedgerService.listRecentCreditPurchases(profileId, limit)
        );
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
