package com.webgen.webgen_backend.billing.service.impl;

import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.billing.config.StripeProperties;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionRequestDTO;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;
import com.webgen.webgen_backend.billing.dto.CreatePortalSessionResponseDTO;
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.integration.StripeBillingGateway;
import com.webgen.webgen_backend.billing.mapper.BillingCheckoutMapper;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.billing.service.BillingCheckoutService;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class BillingCheckoutServiceImpl implements BillingCheckoutService {

    private static final String PLAN_WEBSITE_GENERATOR_PRO = "website_generator_pro";
    private static final String RESOURCE_MISSING = "resource_missing";
    private static final List<String> ACTIVE_SUBSCRIPTION_STATUSES = List.of("trialing", "active", "past_due");

    private final StripeBillingGateway stripeBillingGateway;
    private final StripeProperties stripeProperties;
    private final ProfileRepository profileRepository;
    private final BillingSubscriptionRepository billingSubscriptionRepository;
    private final BillingCheckoutMapper billingCheckoutMapper;
    private final AccountDeletionStateService accountDeletionStateService;

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

        log.debug("Checkout session requested profileId={} priceKey={}", profileId, request.getPriceKey());

        ensureCheckoutRedirectUrlsConfigured();
        Profile profile = resolveExistingProfileForBilling(profileId);
        accountDeletionStateService.assertAccountActive(profileId);

        PriceSelection selection = resolvePriceSelection(request.getPriceKey());
        preventDuplicatePlanCheckout(profile.getId(), selection);
        boolean reusedStoredCustomer = StringUtils.hasText(profile.getStripeCustomerId());
        String stripeCustomerId = resolveOrCreateStripeCustomerId(profile);
        SessionCreateParams params = buildCheckoutSessionParams(
                profileId,
                stripeCustomerId,
                request.getPriceKey(),
                selection
        );

        log.debug("Creating Stripe checkout session mode={} priceId={}", selection.mode(), selection.priceId());

        Session session;
        try {
            session = stripeBillingGateway.createCheckoutSession(params);
        } catch (StripeException exception) {
            if (!reusedStoredCustomer || !isMissingCheckoutCustomer(exception)) {
                throw stripeCheckoutFailure(exception);
            }
            session = replaceMissingCustomerAndRetryCheckout(
                    profile,
                    request.getPriceKey(),
                    selection,
                    exception
            );
        }

        log.info("Checkout session created profileId={} sessionId={}", profileId, session.getId());

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

        log.debug("Portal session requested profileId={}", profileId);

        ensurePortalReturnUrlConfigured();
        Profile profile = resolveExistingProfileForBilling(profileId);
        accountDeletionStateService.assertAccountActive(profileId);
        String stripeCustomerId = resolveOrCreateStripeCustomerId(profile);

        com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(stripeCustomerId)
                        .setReturnUrl(stripeProperties.getPortalReturnUrl().trim())
                        .build();

        com.stripe.model.billingportal.Session portalSession;
        try {
            portalSession = stripeBillingGateway.createPortalSession(params);
        } catch (StripeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to create Stripe billing portal session",
                    exception
            );
        }

        log.info("Portal session created profileId={} sessionId={}", profileId, portalSession.getId());

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

    private Profile resolveExistingProfileForBilling(UUID profileId) {
        return profileRepository.findByIdForUpdate(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile with profile id not found"));
    }

    /**
     * Returns the persisted Stripe customer id for the profile, creating one in Stripe when missing.
     */
    private String resolveOrCreateStripeCustomerId(Profile profile) {
        if (StringUtils.hasText(profile.getStripeCustomerId())) {
            log.debug("Reusing Stripe customer profileId={} customerId={}",
                    profile.getId(), profile.getStripeCustomerId());
            return profile.getStripeCustomerId().trim();
        }

        return createAndPersistStripeCustomer(profile);
    }

    private String createAndPersistStripeCustomer(Profile profile) {
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
            customer = stripeBillingGateway.createCustomer(createCustomerParams.build());
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
        log.info("Created Stripe customer profileId={} customerId={}", profile.getId(), customer.getId());
        return customer.getId();
    }

    private Session replaceMissingCustomerAndRetryCheckout(
            Profile profile,
            CreateCheckoutSessionRequestDTO.PriceKey priceKey,
            PriceSelection selection,
            StripeException missingCustomerException
    ) {
        Optional<BillingSubscription> activeSubscription = billingSubscriptionRepository
                .findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc(
                        profile.getId(),
                        ACTIVE_SUBSCRIPTION_STATUSES
                );
        if (activeSubscription.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Stripe customer recovery was blocked because an active subscription exists. "
                            + "Check the configured Stripe account.",
                    missingCustomerException
            );
        }

        log.warn(
                "Replacing a missing Stripe customer for profile {} after checkout request {}",
                profile.getId(),
                missingCustomerException.getRequestId()
        );
        String replacementCustomerId = createAndPersistStripeCustomer(profile);
        SessionCreateParams retryParams = buildCheckoutSessionParams(
                profile.getId(),
                replacementCustomerId,
                priceKey,
                selection
        );

        try {
            return stripeBillingGateway.createCheckoutSession(retryParams);
        } catch (StripeException retryException) {
            throw stripeCheckoutFailure(retryException);
        }
    }

    private boolean isMissingCheckoutCustomer(StripeException exception) {
        return exception instanceof InvalidRequestException invalidRequestException
                && RESOURCE_MISSING.equals(invalidRequestException.getCode())
                && "customer".equals(invalidRequestException.getParam());
    }

    private ResponseStatusException stripeCheckoutFailure(StripeException cause) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Failed to create Stripe checkout session",
                cause
        );
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
