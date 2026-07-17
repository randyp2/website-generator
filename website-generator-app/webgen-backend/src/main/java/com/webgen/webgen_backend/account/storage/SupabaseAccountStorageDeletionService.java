package com.webgen.webgen_backend.account.storage;

import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.SiteOwnershipVerificationRepository;
import com.webgen.webgen_backend.shared.storage.SupabaseStorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Deletes all Supabase Storage prefixes derived from account-owned records.
 */
@Service
@RequiredArgsConstructor
public class SupabaseAccountStorageDeletionService {

    private static final String PRIVATE_RESUMES_BUCKET = "private_resumes";
    private static final String PORTFOLIO_UPLOADS_BUCKET = "portfolio_uploads";

    private final PortfolioRepository portfolioRepository;
    private final SiteOwnershipVerificationRepository siteOwnershipVerificationRepository;
    private final SupabaseStorageClient supabaseStorageClient;

    /**
     * Discovers account-owned logical prefixes while database ownership rows still exist.
     *
     * @param profileId authenticated account id
     */
    public void deleteForAccount(UUID profileId) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profileId is required");
        }

        Set<StoragePrefix> prefixes = new LinkedHashSet<>();
        prefixes.add(new StoragePrefix(
                PRIVATE_RESUMES_BUCKET,
                "resume-verifications/" + profileId
        ));

        for (UUID portfolioId : portfolioRepository.findIdsByUserId(profileId)) {
            prefixes.add(new StoragePrefix(
                    PRIVATE_RESUMES_BUCKET,
                    "resumes/" + portfolioId
            ));
            prefixes.add(new StoragePrefix(
                    PORTFOLIO_UPLOADS_BUCKET,
                    "media/" + portfolioId
            ));
            prefixes.add(new StoragePrefix(
                    PORTFOLIO_UPLOADS_BUCKET,
                    "videos/" + portfolioId
            ));
            prefixes.add(new StoragePrefix(
                    PORTFOLIO_UPLOADS_BUCKET,
                    "screenshots/" + portfolioId
            ));
        }

        for (UUID verificationId :
                siteOwnershipVerificationRepository.findIdsByUserId(profileId)) {
            prefixes.add(new StoragePrefix(
                    PORTFOLIO_UPLOADS_BUCKET,
                    "screenshots/site-verifications/" + verificationId
            ));
        }

        for (StoragePrefix prefix : prefixes) {
            supabaseStorageClient.deletePrefix(prefix.bucket(), prefix.prefix());
        }
    }

    private record StoragePrefix(String bucket, String prefix) {
    }
}
