package com.webgen.webgen_backend.resume_verification_service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.service.ai.AIVerificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AIVerificationServiceImplTest {

    @Test
    void markUploadFailedPersistsFailedLifecycleStatus() {
        ObjectMapper objectMapper = new ObjectMapper();
        AtomicReference<ClaimEvidenceUpload> savedUpload = new AtomicReference<>();
        ClaimEvidenceUploadRepository uploadRepository = stubUploadRepository(savedUpload);
        AIVerificationServiceImpl service = new AIVerificationServiceImpl(
                null,
                null,
                uploadRepository,
                null,
                null,
                objectMapper,
                null,
                null,
                null,
                new com.webgen.webgen_backend.verification.service.ClaimVerificationStatusService() {
                    public void reconcileClaims(UUID profileId, java.util.Collection<UUID> claimIds) {}
                    public void reconcileProfile(UUID profileId) {}
                }
        );
        ClaimEvidenceUpload upload = ClaimEvidenceUpload.builder()
                .id(UUID.randomUUID())
                .status("completed")
                .metadata(objectMapper.createObjectNode())
                .build();

        ReflectionTestUtils.invokeMethod(
                service,
                "markUploadFailed",
                upload,
                "Gemini verification failed"
        );

        assertThat(upload.getStatus()).isEqualTo("failed");
        assertThat(upload.getAnalysisError()).isEqualTo("Gemini verification failed");
        assertThat(savedUpload.get()).isSameAs(upload);

        ObjectNode assetVerification = (ObjectNode) upload.getMetadata().get("assetVerification");
        assertThat(assetVerification.path("status").asText()).isEqualTo("failed");
        assertThat(assetVerification.path("error").asText()).isEqualTo("Gemini verification failed");
        assertThat(assetVerification.path("failedAt").asText()).isNotBlank();
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
