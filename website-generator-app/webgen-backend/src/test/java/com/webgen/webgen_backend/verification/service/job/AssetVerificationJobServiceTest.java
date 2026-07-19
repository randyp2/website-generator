package com.webgen.webgen_backend.verification.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.account.repository.AccountDeletionRequestRepository;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.billing.model.CreditUsagePolicy;
import com.webgen.webgen_backend.billing.service.CreditGuardService;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationEnqueueDTO;
import com.webgen.webgen_backend.verification.entity.AssetVerificationJob;
import com.webgen.webgen_backend.verification.entity.VerificationOutboxEvent;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.AssetVerificationJobRepository;
import com.webgen.webgen_backend.verification.repository.VerificationOutboxRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AssetVerificationJobServiceTest {

    @Test
    void createJobPersistsCreditReservationWithDurableOutbox() {
        UUID reservationId = UUID.randomUUID();
        AtomicReference<AssetVerificationJob> savedJob = new AtomicReference<>();
        AtomicReference<VerificationOutboxEvent> savedOutbox = new AtomicReference<>();
        AssetVerificationJobService service = new AssetVerificationJobService(
                null,
                new ObjectMapper(),
                capturingJobRepository(savedJob),
                capturingOutboxRepository(savedOutbox),
                null,
                activeAccountStateService(),
                new CreditGuardState()
        );
        AssetVerificationEnqueueDTO request = AssetVerificationEnqueueDTO.builder()
                .profileId(UUID.randomUUID())
                .claimId(UUID.randomUUID())
                .uploadId(UUID.randomUUID())
                .creditReservationId(reservationId)
                .storageProvider("r2")
                .storageBucket("verification")
                .storageKey("claims/evidence.pdf")
                .fileSizeBytes(100L)
                .build();

        String jobId = service.createJobAndQueue(request);

        assertThat(savedJob.get()).isNotNull();
        assertThat(savedJob.get().getId().toString()).isEqualTo(jobId);
        assertThat(savedJob.get().getCreditReservationId()).isEqualTo(reservationId);
        assertThat(savedOutbox.get()).isNotNull();
        assertThat(savedOutbox.get().getAggregateId()).isEqualTo(savedJob.get().getId());
        assertThat(savedOutbox.get().getPayload().path("creditReservationId").asText())
                .isEqualTo(reservationId.toString());
    }

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
        AssetVerificationJobService service = service(job, saved, new CreditGuardState());

        service.cancelForAccountDeletion(jobId.toString());

        assertThat(saved.get()).isSameAs(job);
        assertThat(job.getStatus()).isEqualTo("canceled");
        assertThat(job.getCompletedAt()).isNotNull();
        assertThat(job.getError()).isEqualTo("Account deletion is in progress");
    }

    @Test
    void terminalFailureRefundsVerificationReservation() {
        UUID reservationId = UUID.randomUUID();
        AssetVerificationJob job = job("processing", 3, reservationId);
        AtomicReference<AssetVerificationJob> saved = new AtomicReference<>();
        CreditGuardState creditGuardState = new CreditGuardState();
        AssetVerificationJobService service = service(job, saved, creditGuardState);

        boolean retry = service.failAttempt(job.getId().toString(), "provider unavailable");

        assertThat(retry).isFalse();
        assertThat(saved.get()).isSameAs(job);
        assertThat(job.getStatus()).isEqualTo("failed");
        assertThat(creditGuardState.refundedReservationId).isEqualTo(reservationId);
        assertThat(creditGuardState.failureReason).isEqualTo("AssetVerificationFailed");
    }

    @Test
    void deletingQueuedUploadRefundsVerificationReservation() {
        UUID reservationId = UUID.randomUUID();
        AssetVerificationJob job = job("queued", 0, reservationId);
        AtomicReference<AssetVerificationJob> saved = new AtomicReference<>();
        CreditGuardState creditGuardState = new CreditGuardState();
        AssetVerificationJobService service = service(job, saved, creditGuardState);

        service.refundForUploadDeletion(job.getUploadId());

        assertThat(creditGuardState.refundedReservationId).isEqualTo(reservationId);
        assertThat(creditGuardState.failureReason).isEqualTo("AssetVerificationUploadDeleted");
    }

    @Test
    void deletingCompletedUploadKeepsVerificationCharge() {
        AssetVerificationJob job = job("completed", 1, UUID.randomUUID());
        CreditGuardState creditGuardState = new CreditGuardState();
        AssetVerificationJobService service = service(
                job,
                new AtomicReference<>(),
                creditGuardState
        );

        service.refundForUploadDeletion(job.getUploadId());

        assertThat(creditGuardState.refundedReservationId).isNull();
    }

    @Test
    void staleExhaustedJobRefundsVerificationReservation() {
        UUID reservationId = UUID.randomUUID();
        AssetVerificationJob job = job("processing", 3, reservationId);
        AtomicReference<AssetVerificationJob> saved = new AtomicReference<>();
        CreditGuardState creditGuardState = new CreditGuardState();
        AssetVerificationJobService service = service(job, saved, creditGuardState);

        service.recoverStaleJobs();

        assertThat(saved.get()).isSameAs(job);
        assertThat(job.getStatus()).isEqualTo("failed");
        assertThat(creditGuardState.refundedReservationId).isEqualTo(reservationId);
        assertThat(creditGuardState.failureReason).isEqualTo("AssetVerificationTimedOut");
    }

    private AssetVerificationJob job(String status, int attemptCount, UUID reservationId) {
        return AssetVerificationJob.builder()
                .id(UUID.randomUUID())
                .profileId(UUID.randomUUID())
                .claimId(UUID.randomUUID())
                .uploadId(UUID.randomUUID())
                .creditReservationId(reservationId)
                .status(status)
                .attemptCount(attemptCount)
                .maxAttempts(3)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private AssetVerificationJobService service(
            AssetVerificationJob job,
            AtomicReference<AssetVerificationJob> saved,
            CreditGuardState creditGuardState
    ) {
        return new AssetVerificationJobService(
                null,
                new ObjectMapper(),
                repository(job, saved),
                null,
                emptyUploadRepository(),
                null,
                creditGuardState
        );
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
                    case "findByUploadId" -> Optional.of(job);
                    case "findByStatusInAndUpdatedAtBefore" -> List.of(job);
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

    private ClaimEvidenceUploadRepository emptyUploadRepository() {
        return (ClaimEvidenceUploadRepository) Proxy.newProxyInstance(
                ClaimEvidenceUploadRepository.class.getClassLoader(),
                new Class[]{ClaimEvidenceUploadRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.empty();
                    case "toString" -> "ClaimEvidenceUploadRepositoryFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private AssetVerificationJobRepository capturingJobRepository(
            AtomicReference<AssetVerificationJob> saved
    ) {
        return (AssetVerificationJobRepository) Proxy.newProxyInstance(
                AssetVerificationJobRepository.class.getClassLoader(),
                new Class[]{AssetVerificationJobRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        AssetVerificationJob job = (AssetVerificationJob) args[0];
                        saved.set(job);
                        yield job;
                    }
                    case "getReferenceById" -> saved.get();
                    case "toString" -> "CapturingAssetVerificationJobRepository";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private VerificationOutboxRepository capturingOutboxRepository(
            AtomicReference<VerificationOutboxEvent> saved
    ) {
        return (VerificationOutboxRepository) Proxy.newProxyInstance(
                VerificationOutboxRepository.class.getClassLoader(),
                new Class[]{VerificationOutboxRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        VerificationOutboxEvent event = (VerificationOutboxEvent) args[0];
                        saved.set(event);
                        yield event;
                    }
                    case "toString" -> "CapturingVerificationOutboxRepository";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
    }

    private AccountDeletionStateService activeAccountStateService() {
        AccountDeletionRequestRepository repository = (AccountDeletionRequestRepository) Proxy.newProxyInstance(
                AccountDeletionRequestRepository.class.getClassLoader(),
                new Class[]{AccountDeletionRequestRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "existsById" -> false;
                    case "toString" -> "ActiveAccountDeletionRequestRepository";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
        return new AccountDeletionStateService(repository, null);
    }

    private static final class CreditGuardState implements CreditGuardService {
        private UUID refundedReservationId;
        private String failureReason;

        @Override
        public void assertUsageAvailable(UUID profileId, CreditUsagePolicy policy) {
            throw new UnsupportedOperationException("Not used by this test");
        }

        @Override
        public Optional<UUID> reserveCredits(UUID profileId, int credits, String operationCode) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void refundCredits(UUID reservationId, String reason) {
            refundedReservationId = reservationId;
            failureReason = reason;
        }
    }
}
