package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.verification.dto.ResumeVerificationDTO;
import com.webgen.webgen_backend.verification.dto.UpdateResumeVerificationParsedDTO;
import com.webgen.webgen_backend.verification.dto.UploadResumeVerificationRequestDTO;
import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import com.webgen.webgen_backend.verification.mapper.ResumeVerificationMapper;
import com.webgen.webgen_backend.verification.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.verification.service.impl.ResumeVerificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResumeVerificationServiceImplTest {

    // ─── Upload validation ────────────────────────────────────────────────────

    @Test
    void uploadThrowsOnNullRequest() {
        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(UUID.randomUUID()))),
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.uploadResumeVerification(UUID.randomUUID(), null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void uploadThrowsOnBlankBucket() {
        assertUploadValidationFails(req -> req.setRawFileBucket(""));
    }

    @Test
    void uploadThrowsOnBlankFilePath() {
        assertUploadValidationFails(req -> req.setRawFilePath(""));
    }

    @Test
    void uploadThrowsOnBlankOriginalFileName() {
        assertUploadValidationFails(req -> req.setOriginalFileName(""));
    }

    @Test
    void uploadThrowsOnBlankContentType() {
        assertUploadValidationFails(req -> req.setContentType(""));
    }

    @Test
    void uploadThrowsOnNullFileSize() {
        assertUploadValidationFails(req -> req.setFileSizeBytes(null));
    }

    @Test
    void uploadThrowsOnNegativeFileSize() {
        assertUploadValidationFails(req -> req.setFileSizeBytes(-1L));
    }

    // ─── Upload creates / updates ──────────────────────────────────────────────

    @Test
    void uploadCreatesNewEntityWhenNoneExists() {
        UUID userId = UUID.randomUUID();
        AtomicReference<ResumeVerification> savedEntity = new AtomicReference<>();

        ResumeVerificationRepository rvRepo = rvRepoCapturingSave(Optional.empty(), savedEntity);
        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(userId))),
                rvRepo,
                passThroughMapper()
        );

        ResumeVerificationDTO dto = service.uploadResumeVerification(userId, validRequest());

        assertThat(savedEntity.get()).isNotNull();
        assertThat(dto.getRawFileBucket()).isEqualTo("test-bucket");
        assertThat(dto.getRawFilePath()).isEqualTo("test/path.pdf");
        assertThat(dto.getOriginalFileName()).isEqualTo("resume.pdf");
    }

    @Test
    void uploadUpdatesExistingEntityWithoutCreatingNew() {
        UUID userId = UUID.randomUUID();
        UUID existingId = UUID.randomUUID();
        ResumeVerification existing = buildResumeVerification(existingId, userId);
        AtomicBoolean savedCalled = new AtomicBoolean(false);

        ResumeVerificationRepository rvRepo = (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileId".equals(method.getName())) return Optional.of(existing);
                    if ("save".equals(method.getName())) {
                        savedCalled.set(true);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(userId))),
                rvRepo,
                passThroughMapper()
        );

        ResumeVerificationDTO dto = service.uploadResumeVerification(userId, validRequest());

        assertThat(savedCalled.get()).isTrue();
        assertThat(dto.getId()).isEqualTo(existingId);
        assertThat(dto.getRawFileBucket()).isEqualTo("test-bucket");
    }

    @Test
    void uploadCreatesProfileWhenNotFound() {
        UUID userId = UUID.randomUUID();
        AtomicBoolean profileSaved = new AtomicBoolean(false);

        ProfileRepository pRepo = (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) return Optional.empty();
                    if ("save".equals(method.getName())) {
                        profileSaved.set(true);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ResumeVerificationServiceImpl service = buildService(
                pRepo,
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        service.uploadResumeVerification(userId, validRequest());

        assertThat(profileSaved.get()).isTrue();
    }

    // ─── Get ──────────────────────────────────────────────────────────────────

    @Test
    void getResumeVerificationReturnsNullWhenNotFound() {
        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.empty()),
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThat(service.getResumeVerification(UUID.randomUUID())).isNull();
    }

    @Test
    void getResumeVerificationReturnsDtoWhenFound() {
        UUID userId = UUID.randomUUID();
        UUID existingId = UUID.randomUUID();
        ResumeVerification existing = buildResumeVerification(existingId, userId);

        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(userId))),
                rvRepo(Optional.of(existing)),
                passThroughMapper()
        );

        ResumeVerificationDTO dto = service.getResumeVerification(userId);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(existingId);
    }

    // ─── Update parsed data ───────────────────────────────────────────────────

    @Test
    void updateParsedDataThrowsNotFoundWhenNoRecord() {
        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.empty()),
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        UpdateResumeVerificationParsedDTO req = new UpdateResumeVerificationParsedDTO();
        req.setExtractedText("some text");

        assertThatThrownBy(() -> service.updateParsedData(UUID.randomUUID(), req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Test
    void deleteThrowsNotFoundWhenNoRecord() {
        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.empty()),
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.deleteResumeVerification(UUID.randomUUID()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteReturnsDtoAndDeletesEntity() {
        UUID userId = UUID.randomUUID();
        UUID existingId = UUID.randomUUID();
        ResumeVerification existing = buildResumeVerification(existingId, userId);
        AtomicBoolean deleteCalled = new AtomicBoolean(false);

        ResumeVerificationRepository rvRepo = (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileId".equals(method.getName())) return Optional.of(existing);
                    if ("delete".equals(method.getName())) {
                        deleteCalled.set(true);
                        return null;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );

        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(userId))),
                rvRepo,
                passThroughMapper()
        );

        ResumeVerificationDTO dto = service.deleteResumeVerification(userId);

        assertThat(deleteCalled.get()).isTrue();
        assertThat(dto.getId()).isEqualTo(existingId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void assertUploadValidationFails(java.util.function.Consumer<UploadResumeVerificationRequestDTO> mutator) {
        UploadResumeVerificationRequestDTO req = validRequest();
        mutator.accept(req);

        ResumeVerificationServiceImpl service = buildService(
                profileRepo(Optional.of(profile(UUID.randomUUID()))),
                rvRepo(Optional.empty()),
                passThroughMapper()
        );

        assertThatThrownBy(() -> service.uploadResumeVerification(UUID.randomUUID(), req))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private ResumeVerificationServiceImpl buildService(
            ProfileRepository profileRepository,
            ResumeVerificationRepository resumeVerificationRepository,
            ResumeVerificationMapper mapper
    ) {
        return new ResumeVerificationServiceImpl(
                profileRepository, resumeVerificationRepository, mapper
        );
    }

    @SuppressWarnings("unchecked")
    private ProfileRepository profileRepo(Optional<Profile> profile) {
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) return profile;
                    if ("save".equals(method.getName())) return args[0];
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ResumeVerificationRepository rvRepo(Optional<ResumeVerification> result) {
        return (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileId".equals(method.getName())) return result;
                    if ("save".equals(method.getName())) return args[0];
                    if ("delete".equals(method.getName())) return null;
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ResumeVerificationRepository rvRepoCapturingSave(
            Optional<ResumeVerification> initial,
            AtomicReference<ResumeVerification> captured
    ) {
        return (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findByProfileId".equals(method.getName())) return initial;
                    if ("save".equals(method.getName())) {
                        captured.set((ResumeVerification) args[0]);
                        return args[0];
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ResumeVerificationMapper passThroughMapper() {
        return (ResumeVerificationMapper) Proxy.newProxyInstance(
                ResumeVerificationMapper.class.getClassLoader(),
                new Class[]{ResumeVerificationMapper.class},
                (proxy, method, args) -> {
                    if ("toDto".equals(method.getName())) {
                        ResumeVerification rv = (ResumeVerification) args[0];
                        ResumeVerificationDTO dto = new ResumeVerificationDTO();
                        dto.setId(rv.getId());
                        dto.setRawFileBucket(rv.getRawFileBucket());
                        dto.setRawFilePath(rv.getRawFilePath());
                        dto.setOriginalFileName(rv.getOriginalFileName());
                        dto.setContentType(rv.getContentType());
                        dto.setFileSizeBytes(rv.getFileSizeBytes());
                        return dto;
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
            default -> throw new UnsupportedOperationException("Unexpected method: " + methodName);
        };
    }

    private UploadResumeVerificationRequestDTO validRequest() {
        UploadResumeVerificationRequestDTO req = new UploadResumeVerificationRequestDTO();
        req.setRawFileBucket("test-bucket");
        req.setRawFilePath("test/path.pdf");
        req.setOriginalFileName("resume.pdf");
        req.setContentType("application/pdf");
        req.setFileSizeBytes(1024L);
        return req;
    }

    private Profile profile(UUID id) {
        Profile profile = new Profile();
        profile.setId(id);
        return profile;
    }

    private ResumeVerification buildResumeVerification(UUID id, UUID profileId) {
        Profile profile = new Profile();
        profile.setId(profileId);
        ResumeVerification rv = new ResumeVerification();
        rv.setId(id);
        rv.setProfile(profile);
        rv.setRawFileBucket("test-bucket");
        rv.setRawFilePath("test/path.pdf");
        rv.setOriginalFileName("resume.pdf");
        rv.setContentType("application/pdf");
        rv.setFileSizeBytes(1024L);
        rv.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        rv.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return rv;
    }
}
