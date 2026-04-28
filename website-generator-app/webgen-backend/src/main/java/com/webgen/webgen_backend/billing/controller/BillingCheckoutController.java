package com.webgen.webgen_backend.billing.controller;

import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionRequestDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;
import com.webgen.webgen_backend.billing.service.BillingCheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingCheckoutController {

    private final BillingCheckoutService billingCheckoutService;

    @PostMapping("/checkout/session")
    public ResponseEntity<CreateCheckoutSessionResponseDTO> createCheckoutSession(
            @RequestBody CreateCheckoutSessionRequestDTO request
    ) {
        UUID profileId = resolveAuthenticatedUserId();
        return ResponseEntity.ok(
                billingCheckoutService.createCheckoutSession(profileId, request)
        );
    }

    private UUID resolveAuthenticatedUserId() {
        return UUID.fromString(
                (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );
    }
}
