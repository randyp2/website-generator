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
import com.webgen.webgen_backend.billing.entity.BillingSubscription;
import com.webgen.webgen_backend.billing.integration.StripeBillingGateway;
import com.webgen.webgen_backend.billing.mapper.BillingCheckoutMapper;
import com.webgen.webgen_backend.billing.repository.BillingSubscriptionRepository;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BillingCheckoutServiceImplTest {

    @Test
    void replacesMissingStoredCustomerAndRetriesCheckoutOnce() {
        Profile profile = profileWithCustomer("cus_stale");
        RecordingStripeBillingGateway gateway = new RecordingStripeBillingGateway(
                missingResource("customer"),
                successfulCheckoutSession(),
                customer("cus_replacement")
        );
        AtomicReference<Profile> savedProfile = new AtomicReference<>();
        BillingCheckoutServiceImpl service = service(
                profile,
                gateway,
                Optional.empty(),
                savedProfile
        );

        CreateCheckoutSessionResponseDTO response = service.createCheckoutSession(
                profile.getId(),
                request(CreateCheckoutSessionRequestDTO.PriceKey.CREDIT_PACK_SMALL)
        );

        assertThat(response.getCheckoutUrl()).isEqualTo("https://checkout.stripe.test/session");
        assertThat(gateway.checkoutCustomerIds).containsExactly("cus_stale", "cus_replacement");
        assertThat(gateway.createCustomerCalls).isEqualTo(1);
        assertThat(profile.getStripeCustomerId()).isEqualTo("cus_replacement");
        assertThat(savedProfile.get()).isSameAs(profile);
    }

    @Test
    void doesNotReplaceMissingCustomerWhenLocalSubscriptionIsActive() {
        Profile profile = profileWithCustomer("cus_stale");
        RecordingStripeBillingGateway gateway = new RecordingStripeBillingGateway(
                missingResource("customer"),
                successfulCheckoutSession(),
                customer("cus_replacement")
        );
        BillingCheckoutServiceImpl service = service(
                profile,
                gateway,
                Optional.of(new BillingSubscription()),
                new AtomicReference<>()
        );

        assertThatThrownBy(() -> service.createCheckoutSession(
                profile.getId(),
                request(CreateCheckoutSessionRequestDTO.PriceKey.CREDIT_PACK_SMALL)
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(exception.getReason()).contains("active subscription");
        });
        assertThat(gateway.checkoutCustomerIds).containsExactly("cus_stale");
        assertThat(gateway.createCustomerCalls).isZero();
        assertThat(profile.getStripeCustomerId()).isEqualTo("cus_stale");
    }

    @Test
    void doesNotReplaceCustomerForAnotherMissingStripeResource() {
        Profile profile = profileWithCustomer("cus_current");
        RecordingStripeBillingGateway gateway = new RecordingStripeBillingGateway(
                missingResource("price"),
                successfulCheckoutSession(),
                customer("cus_replacement")
        );
        BillingCheckoutServiceImpl service = service(
                profile,
                gateway,
                Optional.empty(),
                new AtomicReference<>()
        );

        assertThatThrownBy(() -> service.createCheckoutSession(
                profile.getId(),
                request(CreateCheckoutSessionRequestDTO.PriceKey.CREDIT_PACK_SMALL)
        )).isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY)
        );
        assertThat(gateway.checkoutCustomerIds).containsExactly("cus_current");
        assertThat(gateway.createCustomerCalls).isZero();
        assertThat(profile.getStripeCustomerId()).isEqualTo("cus_current");
    }

    private BillingCheckoutServiceImpl service(
            Profile profile,
            RecordingStripeBillingGateway gateway,
            Optional<BillingSubscription> activeSubscription,
            AtomicReference<Profile> savedProfile
    ) {
        return new BillingCheckoutServiceImpl(
                gateway,
                stripeProperties(),
                profileRepository(profile, savedProfile),
                subscriptionRepository(activeSubscription),
                checkoutMapper(),
                accountDeletionStateService()
        );
    }

    private StripeProperties stripeProperties() {
        StripeProperties properties = new StripeProperties();
        properties.setSuccessUrl("http://localhost/dashboard/billing/success");
        properties.setCancelUrl("http://localhost/dashboard/billing");
        properties.setPortalReturnUrl("http://localhost/dashboard/billing");
        properties.getPrice().setCreditPackSmall("price_credits_small");
        return properties;
    }

    private Profile profileWithCustomer(String stripeCustomerId) {
        Profile profile = new Profile();
        profile.setId(UUID.randomUUID());
        profile.setEmail("billing@example.com");
        profile.setFullName("Billing User");
        profile.setStripeCustomerId(stripeCustomerId);
        return profile;
    }

    private CreateCheckoutSessionRequestDTO request(
            CreateCheckoutSessionRequestDTO.PriceKey priceKey
    ) {
        CreateCheckoutSessionRequestDTO request = new CreateCheckoutSessionRequestDTO();
        request.setPriceKey(priceKey);
        return request;
    }

    private InvalidRequestException missingResource(String parameter) {
        return new InvalidRequestException(
                "No such " + parameter,
                parameter,
                "req_checkout",
                "resource_missing",
                404,
                null
        );
    }

    private Session successfulCheckoutSession() {
        Session session = new Session();
        session.setId("cs_test_success");
        session.setUrl("https://checkout.stripe.test/session");
        session.setMode("payment");
        return session;
    }

    private Customer customer(String id) {
        Customer customer = new Customer();
        customer.setId(id);
        return customer;
    }

    private ProfileRepository profileRepository(
            Profile profile,
            AtomicReference<Profile> savedProfile
    ) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByIdForUpdate" -> Optional.of(profile);
                    case "save" -> {
                        savedProfile.set((Profile) args[0]);
                        yield args[0];
                    }
                    case "toString" -> "ProfileRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected profile repository method: " + method.getName()
                    );
                }
        );
    }

    private BillingSubscriptionRepository subscriptionRepository(
            Optional<BillingSubscription> activeSubscription
    ) {
        return (BillingSubscriptionRepository) Proxy.newProxyInstance(
                BillingSubscriptionRepository.class.getClassLoader(),
                new Class[]{BillingSubscriptionRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findFirstByProfile_IdAndPlanKeyAndStatusInOrderByCurrentPeriodEndDesc" ->
                            Optional.empty();
                    case "findFirstByProfile_IdAndStatusInOrderByCurrentPeriodEndDesc" ->
                            activeSubscription;
                    case "toString" -> "BillingSubscriptionRepositoryStub";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected billing subscription repository method: " + method.getName()
                    );
                }
        );
    }

    private BillingCheckoutMapper checkoutMapper() {
        return session -> CreateCheckoutSessionResponseDTO.builder()
                .sessionId(session.getId())
                .checkoutUrl(session.getUrl())
                .mode(session.getMode())
                .build();
    }

    private AccountDeletionStateService accountDeletionStateService() {
        return new AccountDeletionStateService(null, null) {
            @Override
            public void assertAccountActive(UUID profileId) {
            }
        };
    }

    private static final class RecordingStripeBillingGateway extends StripeBillingGateway {

        private final StripeException firstCheckoutFailure;
        private final Session checkoutResponse;
        private final Customer customerResponse;
        private final List<String> checkoutCustomerIds = new ArrayList<>();
        private int createCustomerCalls;

        private RecordingStripeBillingGateway(
                StripeException firstCheckoutFailure,
                Session checkoutResponse,
                Customer customerResponse
        ) {
            super(null);
            this.firstCheckoutFailure = firstCheckoutFailure;
            this.checkoutResponse = checkoutResponse;
            this.customerResponse = customerResponse;
        }

        @Override
        public Customer createCustomer(CustomerCreateParams params) {
            createCustomerCalls++;
            return customerResponse;
        }

        @Override
        public Session createCheckoutSession(SessionCreateParams params) throws StripeException {
            checkoutCustomerIds.add(params.getCustomer());
            if (checkoutCustomerIds.size() == 1 && firstCheckoutFailure != null) {
                throw firstCheckoutFailure;
            }
            return checkoutResponse;
        }
    }
}
