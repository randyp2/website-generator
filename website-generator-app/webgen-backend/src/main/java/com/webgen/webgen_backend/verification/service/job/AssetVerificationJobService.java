package com.webgen.webgen_backend.verification.service.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationEnqueueDTO;
import com.webgen.webgen_backend.verification.dto.job.AssetVerificationJobStatusDTO;
import com.webgen.webgen_backend.verification.entity.AssetVerificationJob;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import com.webgen.webgen_backend.verification.entity.VerificationOutboxEvent;
import com.webgen.webgen_backend.verification.repository.AssetVerificationJobRepository;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceUploadRepository;
import com.webgen.webgen_backend.verification.repository.VerificationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Durable verification-job state with Redis used only as a polling cache. */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssetVerificationJobService {
    private static final String KEY_PREFIX = "verify:job:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final int MAX_ATTEMPTS = 3;

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final AssetVerificationJobRepository jobRepository;
    private final VerificationOutboxRepository outboxRepository;
    private final ClaimEvidenceUploadRepository uploadRepository;
    private final AccountDeletionStateService accountDeletionStateService;

    @Transactional
    public String createJobAndQueue(AssetVerificationEnqueueDTO request) {
        accountDeletionStateService.assertAccountActive(request.getProfileId());
        UUID jobId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        AssetVerificationMessage message = toMessage(jobId, request, now);
        jobRepository.save(AssetVerificationJob.builder()
                .id(jobId).profileId(request.getProfileId()).claimId(request.getClaimId())
                .uploadId(request.getUploadId()).status("queued").attemptCount(0)
                .maxAttempts(MAX_ATTEMPTS).createdAt(now).updatedAt(now).build());
        outboxRepository.save(VerificationOutboxEvent.builder()
                .id(UUID.randomUUID()).aggregateId(jobId).eventType("asset_verification_requested")
                .payload(objectMapper.valueToTree(message)).status("pending").attemptCount(0)
                .availableAt(now).createdAt(now).updatedAt(now).build());
        cache(toDto(jobRepository.getReferenceById(jobId)));
        log.info("Verification job persisted with outbox jobId={} profileId={} claimId={} uploadId={}",
                jobId, request.getProfileId(), request.getClaimId(), request.getUploadId());
        return jobId.toString();
    }

    @Transactional
    public boolean beginAttempt(String jobId) {
        AssetVerificationJob job = requireJob(jobId);
        if ("completed".equals(job.getStatus())) {
            log.info("Duplicate verification delivery ignored jobId={} uploadId={}", jobId, job.getUploadId());
            return false;
        }
        if (job.getAttemptCount() >= job.getMaxAttempts()) {
            return false;
        }
        job.setAttemptCount(job.getAttemptCount() + 1);
        job.setStatus("processing");
        job.setStartedAt(OffsetDateTime.now());
        job.setUpdatedAt(OffsetDateTime.now());
        updateUploadStatus(job.getUploadId(), "analyzing", null);
        save(job);
        return true;
    }

    @Transactional
    public void complete(String jobId) {
        AssetVerificationJob job = requireJob(jobId);
        job.setStatus("completed");
        job.setError(null);
        job.setCompletedAt(OffsetDateTime.now());
        job.setUpdatedAt(OffsetDateTime.now());
        save(job);
    }

    @Transactional
    public boolean failAttempt(String jobId, String message) {
        AssetVerificationJob job = requireJob(jobId);
        boolean retry = job.getAttemptCount() < job.getMaxAttempts();
        job.setStatus(retry ? "queued" : "failed");
        job.setError(abbreviate(message));
        job.setUpdatedAt(OffsetDateTime.now());
        if (retry) {
            updateUploadStatus(job.getUploadId(), "queued", null);
            enqueueRetry(job, OffsetDateTime.now().plusSeconds(retryBackoffSeconds(job.getAttemptCount())));
        } else {
            updateUploadStatus(job.getUploadId(), "failed", job.getError());
        }
        save(job);
        log.warn("Verification attempt failed jobId={} attempt={}/{} retry={} reason={}",
                jobId, job.getAttemptCount(), job.getMaxAttempts(), retry, message);
        return retry;
    }

    /**
     * Stops a queued or in-flight verification from being recovered after deletion begins.
     */
    @Transactional
    public void cancelForAccountDeletion(String jobId) {
        if (jobId == null) {
            return;
        }
        try {
            jobRepository.findById(UUID.fromString(jobId)).ifPresent(job -> {
                job.setStatus("canceled");
                job.setError("Account deletion is in progress");
                job.setCompletedAt(OffsetDateTime.now());
                job.setUpdatedAt(OffsetDateTime.now());
                save(job);
            });
        } catch (IllegalArgumentException exception) {
            log.warn("Unable to cancel malformed verification job id={}", jobId);
        }
    }

    public AssetVerificationJobStatusDTO getJob(String jobId) {
        AssetVerificationJobStatusDTO cached = readCache(jobId);
        if (cached != null) return cached;
        try {
            return jobRepository.findById(UUID.fromString(jobId)).map(this::toDto).orElse(null);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    @Scheduled(fixedDelayString = "${verification.jobs.recovery-ms:60000}")
    @Transactional
    public void recoverStaleJobs() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusMinutes(10);
        List<AssetVerificationJob> stale = jobRepository.findByStatusInAndUpdatedAtBefore(
                List.of("queued", "processing"), cutoff);
        for (AssetVerificationJob job : stale) {
            if (job.getAttemptCount() >= job.getMaxAttempts()) {
                job.setStatus("failed");
                job.setError("Verification timed out after maximum attempts");
                updateUploadStatus(job.getUploadId(), "failed", job.getError());
            } else {
                enqueueRetry(job, OffsetDateTime.now());
                job.setStatus("queued");
            }
            job.setUpdatedAt(OffsetDateTime.now());
            save(job);
        }
        if (!stale.isEmpty()) log.info("Recovered stale verification jobs count={}", stale.size());
    }

    private void enqueueRetry(AssetVerificationJob job, OffsetDateTime availableAt) {
        ClaimEvidenceUpload upload = uploadRepository.findById(job.getUploadId()).orElseThrow();
        AssetVerificationMessage message = AssetVerificationMessage.builder()
                .jobId(job.getId().toString()).profileId(job.getProfileId().toString())
                .claimId(job.getClaimId().toString()).uploadId(job.getUploadId().toString())
                .storageProvider(upload.getStorageProvider()).storageBucket(upload.getStorageBucket())
                .storageKey(upload.getStorageKey()).fileSizeBytes(upload.getFileSizeBytes())
                .queuedAt(OffsetDateTime.now().toString()).build();
        OffsetDateTime now = OffsetDateTime.now();
        outboxRepository.save(VerificationOutboxEvent.builder()
                .id(UUID.randomUUID()).aggregateId(job.getId())
                .eventType("asset_verification_retry_" + (job.getAttemptCount() + 1))
                .payload(objectMapper.valueToTree(message))
                .status("pending").attemptCount(0).availableAt(availableAt).createdAt(now).updatedAt(now).build());
    }

    private long retryBackoffSeconds(int attempt) {
        return Math.min(300, 5L << Math.min(attempt - 1, 6));
    }

    private AssetVerificationMessage toMessage(UUID jobId, AssetVerificationEnqueueDTO request, OffsetDateTime now) {
        return AssetVerificationMessage.builder().jobId(jobId.toString())
                .uploadId(request.getUploadId().toString()).claimId(request.getClaimId().toString())
                .profileId(request.getProfileId().toString()).storageProvider(request.getStorageProvider())
                .storageBucket(request.getStorageBucket()).storageKey(request.getStorageKey())
                .fileSizeBytes(request.getFileSizeBytes()).queuedAt(now.toString()).build();
    }

    private AssetVerificationJob requireJob(String id) {
        return jobRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Verification job not found: " + id));
    }

    private void save(AssetVerificationJob job) {
        jobRepository.save(job);
        cache(toDto(job));
    }

    private void updateUploadStatus(UUID uploadId, String status, String error) {
        uploadRepository.findById(uploadId).ifPresent(upload -> {
            upload.setStatus(status);
            upload.setAnalysisError(error);
            upload.setUpdatedAt(OffsetDateTime.now());
            uploadRepository.save(upload);
        });
    }

    private AssetVerificationJobStatusDTO toDto(AssetVerificationJob job) {
        return AssetVerificationJobStatusDTO.builder().jobId(job.getId().toString())
                .uploadId(job.getUploadId().toString()).claimId(job.getClaimId().toString())
                .profileId(job.getProfileId().toString())
                .status(AssetVerificationJobStatusDTO.Status.valueOf(job.getStatus().toUpperCase()))
                .error(Optional.ofNullable(job.getError()).orElse("")).build();
    }

    private void cache(AssetVerificationJobStatusDTO dto) {
        try {
            redisTemplate.opsForValue().set(KEY_PREFIX + dto.getJobId(), objectMapper.writeValueAsString(dto), CACHE_TTL);
        } catch (Exception exception) {
            log.warn("Verification job cache write failed jobId={} reason={}", dto.getJobId(), exception.getMessage());
        }
    }

    private AssetVerificationJobStatusDTO readCache(String jobId) {
        try {
            String json = redisTemplate.opsForValue().get(KEY_PREFIX + jobId);
            return json == null ? null : objectMapper.readValue(json, AssetVerificationJobStatusDTO.class);
        } catch (Exception exception) {
            log.warn("Verification job cache read failed jobId={} reason={}", jobId, exception.getMessage());
            return null;
        }
    }

    private String abbreviate(String value) {
        if (value == null) return "Unknown verification error";
        return value.substring(0, Math.min(500, value.length()));
    }
}
