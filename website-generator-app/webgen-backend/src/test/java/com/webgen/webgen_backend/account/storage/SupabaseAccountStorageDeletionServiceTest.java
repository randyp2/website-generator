package com.webgen.webgen_backend.account.storage;

import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.shared.storage.SupabaseStorageClient;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SupabaseAccountStorageDeletionServiceTest {

    @Test
    void deletesEveryAccountOwnedSupabasePrefix() {
        UUID profileId = UUID.randomUUID();
        UUID firstPortfolioId = UUID.randomUUID();
        UUID secondPortfolioId = UUID.randomUUID();
        UUID verificationId = UUID.randomUUID();
        RecordingSupabaseStorageClient storageClient =
                new RecordingSupabaseStorageClient();
        SupabaseAccountStorageDeletionService service =
                new SupabaseAccountStorageDeletionService(
                        repository(
                                PortfolioRepository.class,
                                "findIdsByUserId",
                                List.of(firstPortfolioId, secondPortfolioId)
                        ),
                        repository(
                                SiteOwnershipVerificationRepository.class,
                                "findIdsByUserId",
                                List.of(verificationId)
                        ),
                        storageClient
                );

        service.deleteForAccount(profileId);

        assertThat(storageClient.deletedPrefixes).containsExactly(
                new DeletedPrefix(
                        "private_resumes",
                        "resume-verifications/" + profileId
                ),
                new DeletedPrefix(
                        "private_resumes",
                        "resumes/" + firstPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "media/" + firstPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "videos/" + firstPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "screenshots/" + firstPortfolioId
                ),
                new DeletedPrefix(
                        "private_resumes",
                        "resumes/" + secondPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "media/" + secondPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "videos/" + secondPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "screenshots/" + secondPortfolioId
                ),
                new DeletedPrefix(
                        "portfolio_uploads",
                        "screenshots/site-verifications/" + verificationId
                )
        );
    }

    @SuppressWarnings("unchecked")
    private <T> T repository(
            Class<T> contract,
            String queryMethod,
            List<UUID> ids
    ) {
        return (T) Proxy.newProxyInstance(
                contract.getClassLoader(),
                new Class[]{contract},
                (proxy, method, args) -> switch (method.getName()) {
                    case "toString" -> contract.getSimpleName() + "Fixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> {
                        if (queryMethod.equals(method.getName())) {
                            yield ids;
                        }
                        throw new UnsupportedOperationException(method.getName());
                    }
                }
        );
    }

    private static final class RecordingSupabaseStorageClient
            extends SupabaseStorageClient {

        private final List<DeletedPrefix> deletedPrefixes = new ArrayList<>();

        private RecordingSupabaseStorageClient() {
            super(new RestTemplate(), "https://example.supabase.co", "secret");
        }

        @Override
        public void deletePrefix(String bucket, String prefix) {
            deletedPrefixes.add(new DeletedPrefix(bucket, prefix));
        }
    }

    private record DeletedPrefix(String bucket, String prefix) {
    }
}
