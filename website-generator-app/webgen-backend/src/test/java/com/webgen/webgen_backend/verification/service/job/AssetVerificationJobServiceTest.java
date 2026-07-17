package com.webgen.webgen_backend.verification.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.entity.AssetVerificationJob;
import com.webgen.webgen_backend.verification.repository.AssetVerificationJobRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AssetVerificationJobServiceTest {

    @Test
    void cancelsVerificationWithoutCreatingARecoverableStatus() {
        UUID jobId = UUID.randomUUID();
        AssetVerificationJob job = AssetVerificationJob.builder()
                .id(jobId)
                .profileId(UUID.randomUUID())
                .claimId(UUID.randomUUID())
                .uploadId(UUID.randomUUID())
                .status("queued")
                .attemptCount(0)
                .maxAttempts(3)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        AtomicReference<AssetVerificationJob> saved = new AtomicReference<>();
        AssetVerificationJobService service = new AssetVerificationJobService(
                null,
                new ObjectMapper(),
                repository(job, saved),
                null,
                null,
                null
        );

        service.cancelForAccountDeletion(jobId.toString());

        assertThat(saved.get()).isSameAs(job);
        assertThat(job.getStatus()).isEqualTo("canceled");
        assertThat(job.getCompletedAt()).isNotNull();
        assertThat(job.getError()).isEqualTo("Account deletion is in progress");
    }

    private AssetVerificationJobRepository repository(
            AssetVerificationJob job,
            AtomicReference<AssetVerificationJob> saved
    ) {
        return (AssetVerificationJobRepository) Proxy.newProxyInstance(
                AssetVerificationJobRepository.class.getClassLoader(),
                new Class[]{AssetVerificationJobRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.of(job);
                    case "save" -> {
                        saved.set((AssetVerificationJob) args[0]);
                        yield args[0];
                    }
                    case "toString" -> "AssetVerificationJobRepositoryFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }
}
