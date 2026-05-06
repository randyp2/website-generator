package com.webgen.webgen_backend.billing.service.impl;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionRequestDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;
import com.webgen.webgen_backend.billing.dto.CreatePortalSessionResponseDTO;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.mapper.BillingCheckoutMapper;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingCheckoutService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingCheckoutServiceImpl implements BillingCheckoutService {

    private static final String PLAN_WEBSITE_GENERATOR_PRO = "website_generator_pro";
    private static final List<String> ACTIVE_SUBSCRIPTION_STATUSES = List.of("trialing", "active", "past_due");

    private final StripeClient stripeClient;
    private final StripeProperties stripeProperties;
    private final ProfileRepository profileRepository;
    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final BillingCheckoutMapper billingCheckoutMapper;

    @Override
    @Transactional
    public CreateCheckoutSessionResponseDTO createCheckoutSession(
            UUID profileId,
            CreateCheckoutSessionRequestDTO request
    ) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profileId is required");
        }
        if (request == null || request.getPriceKey() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priceKey is required");
        }

        System.out.println(">>> [BillingCheckout] createCheckoutSession start profileId=" + profileId
                + " priceKey=" + request.getPriceKey());

        ensureCheckoutRedirectUrlsConfigured();
        Profile profile = resolveExistingProfile(profileId);

        PriceSelection selection = resolvePriceSelection(request.getPriceKey());
        preventDuplicatePlanCheckout(profile.getId(), selection);
        String stripeCustomerId = resolveOrCreateStripeCustomerId(profile);
        SessionCreateParams params = buildCheckoutSessionParams(
                profileId,
                stripeCustomerId,
                request.getPriceKey(),
                selection
        );

        System.out.println(">>> [BillingCheckout] calling Stripe checkout.sessions.create mode="
                + selection.mode() + " priceId=" + selection.priceId());

        Session session;
        try {
            session = stripeClient.v1().checkout().sessions().create(params);
        } catch (StripeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to create Stripe checkout session",
                    exception
            );
        }

        System.out.println(">>> [BillingCheckout] checkout session created sessionId=" + session.getId());

        CreateCheckoutSessionResponseDTO response =
                billingCheckoutMapper.toCreateCheckoutSessionResponse(session);

        if (!StringUtils.hasText(response.getCheckoutUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Stripe checkout session returned no URL"
            );
        }

        return response;
    }

    @Override
    @Transactional
    public CreatePortalSessionResponseDTO createPortalSession(UUID profileId) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profileId is required");
        }

        System.out.println(">>> [BillingPortal] createPortalSession start profileId=" + profileId);

        ensurePortalReturnUrlConfigured();
        Profile profile = resolveExistingProfile(profileId);
        String stripeCustomerId = resolveOrCreateStripeCustomerId(profile);

        com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(stripeCustomerId)
                        .setReturnUrl(stripeProperties.getPortalReturnUrl().trim())
                        .build();

        com.stripe.model.billingportal.Session portalSession;
        try {
            portalSession = stripeClient.v1().billingPortal().sessions().create(params);
        } catch (StripeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to create Stripe billing portal session",
                    exception
            );
        }

        System.out.println(">>> [BillingPortal] portal session created sessionId=" + portalSession.getId());

        if (!StringUtils.hasText(portalSession.getUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Stripe billing portal session returned no URL"
            );
        }

        return CreatePortalSessionResponseDTO.builder()
                .sessionId(portalSession.getId())
                .portalUrl(portalSession.getUrl())
                .build();
    }

    /**
     * Ensures checkout redirect URLs are configured before calling Stripe.
     */
    private void ensureCheckoutRedirectUrlsConfigured() {
        if (!StringUtils.hasText(stripeProperties.getSuccessUrl())
                || !StringUtils.hasText(stripeProperties.getCancelUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Stripe success and cancel URLs must be configured"
            );
        }
    }

    /**
     * Ensures billing portal return URL is configured before calling Stripe.
     */
    private void ensurePortalReturnUrlConfigured() {
        if (!StringUtils.hasText(stripeProperties.getPortalReturnUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Stripe billing portal return URL must be configured"
            );
        }
    }

    private Profile resolveExistingProfile(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile with profile id not found"));
    }

    /**
     * Returns the persisted Stripe customer id for the profile, creating one in Stripe when missing.
     */
    private String resolveOrCreateStripeCustomerId(Profile profile) {
        if (StringUtils.hasText(profile.getStripeCustomerId())) {
            System.out.println(">>> [BillingCheckout] reusing stripe customer "
                    + profile.getStripeCustomerId() + " for profile=" + profile.getId());
            return profile.getStripeCustomerId();
        }

        CustomerCreateParams.Builder createCustomerParams = CustomerCreateParams.builder()
                .putMetadata("profile_id", profile.getId().toString());

        if (StringUtils.hasText(profile.getEmail())) {
            createCustomerParams.setEmail(profile.getEmail().trim());
        }
        if (StringUtils.hasText(profile.getFullName())) {
            createCustomerParams.setName(profile.getFullName().trim());
        }

        Customer customer;
        try {
            customer = stripeClient.v1().customers().create(createCustomerParams.build());
        } catch (StripeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to create Stripe customer",
                    exception
            );
        }

        if (!StringUtils.hasText(customer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Stripe customer creation returned no id"
            );
        }

        profile.setStripeCustomerId(customer.getId());
        profileRepository.save(profile);
        System.out.println(">>> [BillingCheckout] created new stripe customer " + customer.getId()
                + " for profile=" + profile.getId());
        return customer.getId();
    }

    /**
     * Resolves the requested purchase option into Stripe price and checkout mode settings.
     */
    private PriceSelection resolvePriceSelection(CreateCheckoutSessionRequestDTO.PriceKey priceKey) {
        return switch (priceKey) {
            case WEBSITE_GENERATOR_PRO_MONTHLY -> new PriceSelection(
                    requirePriceId(
                            stripeProperties.getPrice().getWebsiteGeneratorProMonthly(),
                            "Website Generator Pro monthly is unavailable"
                    ),
                    SessionCreateParams.Mode.SUBSCRIPTION,
                    "plan",
                    PLAN_WEBSITE_GENERATOR_PRO
            );
            case WEBSITE_GENERATOR_PRO_ANNUAL -> new PriceSelection(
                    requirePriceId(
                            stripeProperties.getPrice().getWebsiteGeneratorProAnnual(),
                            "Website Generator Pro annual is unavailable"
                    ),
                    SessionCreateParams.Mode.SUBSCRIPTION,
                    "plan",
                    PLAN_WEBSITE_GENERATOR_PRO
            );
            case CREDIT_PACK_SMALL -> new PriceSelection(
                    requirePriceId(
                            stripeProperties.getPrice().getCreditPackSmall(),
                            "Credit pack small is unavailable"
                    ),
                    SessionCreateParams.Mode.PAYMENT,
                    "credits",
                    null
            );
            case CREDIT_PACK_MEDIUM -> new PriceSelection(
                    requirePriceId(
                            stripeProperties.getPrice().getCreditPackMedium(),
                            "Credit pack medium is unavailable"
                    ),
                    SessionCreateParams.Mode.PAYMENT,
                    "credits",
                    null
            );
            case CREDIT_PACK_LARGE -> new PriceSelection(
                    requirePriceId(
                            stripeProperties.getPrice().getCreditPackLarge(),
                            "Credit pack large is unavailable"
                    ),
                    SessionCreateParams.Mode.PAYMENT,
                    "credits",
                    null
            );
        };
    }

    /**
     * Validates a Stripe price id value and returns a trimmed copy.
     */
    private String requirePriceId(String configuredValue, String unavailableMessage) {
        if (!StringUtils.hasText(configuredValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, unavailableMessage);
        }
        return configuredValue.trim();
    }

    private void preventDuplicatePlanCheckout(UUID profileId, PriceSelection selection) {
        if (selection == null
                || selection.mode() != SessionCreateParams.Mode.SUBSCRIPTION
                || !StringUtils.hasText(selection.planKey())) {
            return;
        }

        Optional<BillingSubscription> existing = billingSubscriptionRepository
                .findFirstByProfile_IdAndPlanKeyAndStatusInOrderByCurrentPeriodEndDesc(
                        profileId,
                        selection.planKey(),
                        ACTIVE_SUBSCRIPTION_STATUSES
                );
        if (existing.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An active subscription already exists for this plan. Use Manage Subscription to change or cancel."
            );
        }
    }

    /**
     * Builds the Stripe checkout session request payload from validated inputs.
     */
    private SessionCreateParams buildCheckoutSessionParams(
            UUID profileId,
            String stripeCustomerId,
            CreateCheckoutSessionRequestDTO.PriceKey priceKey,
            PriceSelection selection
    ) {
        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(selection.mode())
                .setCustomer(stripeCustomerId)
                .setClientReferenceId(profileId.toString())
                .setSuccessUrl(buildSuccessUrl(priceKey))
                .setCancelUrl(stripeProperties.getCancelUrl())
                .putMetadata("profile_id", profileId.toString())
                .putMetadata("price_key", priceKey.name())
                .putMetadata("purchase_type", selection.purchaseType())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(selection.priceId())
                                .setQuantity(1L)
                                .build()
                );

        if (StringUtils.hasText(selection.planKey())) {
            builder.putMetadata("plan_key", selection.planKey());
        }

        return builder.build();
    }

    private String buildSuccessUrl(CreateCheckoutSessionRequestDTO.PriceKey priceKey) {
        String base = stripeProperties.getSuccessUrl().trim();
        String separator = base.contains("?") ? "&" : "?";
        return base + separator + "priceKey=" + priceKey.name() + "&session_id={CHECKOUT_SESSION_ID}";
    }

    private record PriceSelection(
            String priceId,
            SessionCreateParams.Mode mode,
            String purchaseType,
            String planKey
    ) {
    }
}
