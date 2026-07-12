package com.webgen.webgen_backend.resume_verification_service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.ai.AssetVerificationPromptBuilder;
import com.webgen.webgen_backend.verification.service.ai.AssetVerificationResponseParser;
import com.webgen.webgen_backend.verification.service.ai.AssetVerificationPersistenceService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.UUID;
import java.util.Optional;
import java.time.OffsetDateTime;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AIVerificationServiceImplTest {

    @Test
    void persistsMatchConfidenceAndEvidenceDepthSeparately() {
        ObjectMapper objectMapper = new ObjectMapper();
        UUID profileId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        Claim claim = Claim.builder().id(UUID.randomUUID()).profile(profile)
                .claimType("skill").rawValue("React").source("manual").build();
        ClaimEvidenceUpload upload = ClaimEvidenceUpload.builder().id(UUID.randomUUID())
                .profile(profile).claimId(claim.getId()).originalFileName("portfolio.pdf")
                .contentType("application/pdf").storageProvider("r2").storageBucket("bucket")
                .storageKey("key").createdAt(OffsetDateTime.now())
                .metadata(objectMapper.createObjectNode()).build();
        AtomicReference<Evidence> savedEvidence = new AtomicReference<>();
        AtomicReference<ClaimEvidenceLink> savedLink = new AtomicReference<>();
        EvidenceRepository evidenceRepository = repositoryProxy(
                EvidenceRepository.class, savedEvidence, "findByProfileIdAndProviderAndExternalId");
        ClaimEvidenceLinkRepository linkRepository = repositoryProxy(
                ClaimEvidenceLinkRepository.class, savedLink, "findByProfileIdAndClaimIdAndEvidenceId");
        ClaimEvidenceUploadRepository uploadRepository = stubUploadRepository(new AtomicReference<>());
        AssetVerificationResponseParser responseParser = new AssetVerificationResponseParser(objectMapper);
        var parsed = responseParser.parse("""
                {"matchConfidence":0.97,"evidenceDepth":0.32,"summary":"Relevant but shallow.",
                 "evidenceStrength":"WEAK","shouldLink":true}
                """);
        AssetVerificationPersistenceService service = new AssetVerificationPersistenceService(
                uploadRepository, evidenceRepository, linkRepository, objectMapper, noOpStatusService());

        service.persistSuccess(profile, claim, upload,
                AssetVerificationPromptBuilder.AssetFamily.DOCUMENT, parsed, "excerpt");

        assertThat(savedLink.get().getLinkConfidence()).isEqualByComparingTo("0.970");
        assertThat(savedLink.get().getEvidenceDepth()).isEqualByComparingTo("0.320");
        assertThat(savedEvidence.get().getMetadata().path("aiMatchConfidence").asDouble()).isEqualTo(0.97);
        assertThat(savedEvidence.get().getMetadata().path("aiEvidenceDepth").asDouble()).isEqualTo(0.32);
    }

    @Test
    void markUploadFailedPersistsFailedLifecycleStatus() {
        ObjectMapper objectMapper = new ObjectMapper();
        AtomicReference<ClaimEvidenceUpload> savedUpload = new AtomicReference<>();
        ClaimEvidenceUploadRepository uploadRepository = stubUploadRepository(savedUpload);
        AssetVerificationPersistenceService service = new AssetVerificationPersistenceService(
                uploadRepository, null, null, objectMapper, noOpStatusService());
        ClaimEvidenceUpload upload = ClaimEvidenceUpload.builder()
                .id(UUID.randomUUID())
                .status("completed")
                .metadata(objectMapper.createObjectNode())
                .build();

        service.persistFailure(upload, "Gemini verification failed");

        assertThat(upload.getStatus()).isEqualTo("failed");
        assertThat(upload.getAnalysisError()).isEqualTo("Gemini verification failed");
        assertThat(savedUpload.get()).isSameAs(upload);

        ObjectNode assetVerification = (ObjectNode) upload.getMetadata().get("assetVerification");
        assertThat(assetVerification.path("status").asText()).isEqualTo("failed");
        assertThat(assetVerification.path("error").asText()).isEqualTo("Gemini verification failed");
        assertThat(assetVerification.path("failedAt").asText()).isNotBlank();
    }

    @SuppressWarnings("unchecked")
    private <T, R> T repositoryProxy(
            Class<T> repositoryType,
            AtomicReference<R> saved,
            String findMethod
    ) {
        return (T) Proxy.newProxyInstance(
                repositoryType.getClassLoader(), new Class[]{repositoryType},
                (proxy, method, args) -> {
                    if (findMethod.equals(method.getName())) return Optional.empty();
                    if ("save".equals(method.getName())) {
                        R value = (R) args[0];
                        saved.set(value);
                        return value;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                });
    }

    private com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService noOpStatusService() {
        return new com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService() {
            public void reconcileClaims(UUID profileId, java.util.Collection<UUID> claimIds) {}
            public void reconcileProfile(UUID profileId) {}
        };
    }

    @SuppressWarnings("unchecked")
    private ClaimEvidenceUploadRepository stubUploadRepository(
            AtomicReference<ClaimEvidenceUpload> savedUpload
    ) {
        return (ClaimEvidenceUploadRepository) Proxy.newProxyInstance(
                ClaimEvidenceUploadRepository.class.getClassLoader(),
                new Class[]{ClaimEvidenceUploadRepository.class},
                (proxy, method, args) -> {
                    if ("save".equals(method.getName())) {
                        ClaimEvidenceUpload upload = (ClaimEvidenceUpload) args[0];
                        savedUpload.set(upload);
                        return upload;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private Object handleObjectMethod(Object proxy, String methodName, Object[] args) {
        return switch (methodName) {
            case "toString" -> "proxy";
            case "hashCode" -> System.identityHashCode(proxy);
            case "equals" -> proxy == args[0];
            default -> throw new UnsupportedOperationException(
                    "Unexpected repository method invocation: " + methodName
            );
        };
    }
}
