package com.webgen.webgen_backend.resume_verification_service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ResumeVerification;
import com.webgen.webgen_backend.verification.entity.Skill;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.ResumeVerificationRepository;
import com.webgen.webgen_backend.verification.repository.SkillRepository;
import com.webgen.webgen_backend.verification.service.ClaimEvidenceReadService;
import com.webgen.webgen_backend.verification.service.impl.ClaimIngestionServiceImpl;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class ClaimIngestionServiceImplTest {

    @Test
    void ingestSkillClaimsRecoversMalformedParentheticalTokens() {
        UUID profileId = UUID.randomUUID();
        UUID resumeVerificationId = UUID.randomUUID();
        UUID awsSkillId = UUID.randomUUID();

        Skill aws = skill(awsSkillId, "Amazon Web Services");
        Map<String, Skill> namesByLower = Map.of();
        Map<String, Skill> aliasesByLower = Map.of("aws", aws);

        AtomicReference<List<Claim>> savedClaimsRef = new AtomicReference<>(new ArrayList<>());

        ClaimIngestionServiceImpl service = new ClaimIngestionServiceImpl(
                claimRepository(savedClaimsRef.get()),
                skillRepository(namesByLower, aliasesByLower),
                resumeVerificationRepository(profileId, resumeVerificationId),
                profileRepository(profileId),
                emptyEvidenceReadService(),
                new ObjectMapper()
        );

        int upserted = service.ingestSkillClaims(
                profileId,
                resumeVerificationId,
                List.of("AWS (ECS", "S3)")
        );

        assertThat(upserted).isEqualTo(3);
        assertThat(savedClaimsRef.get())
                .extracting(Claim::getRawValue)
                .containsExactly("AWS", "ECS", "S3");

        Map<String, UUID> canonicalByRaw = new HashMap<>();
        for (Claim claim : savedClaimsRef.get()) {
            canonicalByRaw.put(claim.getRawValue(), claim.getCanonicalSkillId());
        }
        assertThat(canonicalByRaw.get("AWS")).isEqualTo(awsSkillId);
        assertThat(canonicalByRaw.get("ECS")).isNull();
        assertThat(canonicalByRaw.get("S3")).isNull();
    }

    @Test
    void ingestSkillClaimsSplitsCommaAndSlashAndDedupesCaseInsensitive() {
        UUID profileId = UUID.randomUUID();
        UUID resumeVerificationId = UUID.randomUUID();
        UUID reactId = UUID.randomUUID();
        UUID reduxId = UUID.randomUUID();

        Skill react = skill(reactId, "React");
        Skill redux = skill(reduxId, "Redux");
        Map<String, Skill> namesByLower = Map.of(
                "react", react,
                "redux", redux
        );
        Map<String, Skill> aliasesByLower = Map.of();

        AtomicReference<List<Claim>> savedClaimsRef = new AtomicReference<>(new ArrayList<>());

        ClaimIngestionServiceImpl service = new ClaimIngestionServiceImpl(
                claimRepository(savedClaimsRef.get()),
                skillRepository(namesByLower, aliasesByLower),
                resumeVerificationRepository(profileId, resumeVerificationId),
                profileRepository(profileId),
                emptyEvidenceReadService(),
                new ObjectMapper()
        );

        int upserted = service.ingestSkillClaims(
                profileId,
                resumeVerificationId,
                List.of("Languages: React/Redux, REACT")
        );

        assertThat(upserted).isEqualTo(2);
        assertThat(savedClaimsRef.get())
                .extracting(Claim::getRawValue)
                .containsExactly("React", "Redux");
        assertThat(savedClaimsRef.get())
                .extracting(Claim::getCanonicalSkillId)
                .containsExactly(reactId, reduxId);
    }

    @SuppressWarnings("unchecked")
    private ClaimRepository claimRepository(List<Claim> savedClaims) {
        Map<String, Claim> byRawLower = new HashMap<>();
        return (ClaimRepository) Proxy.newProxyInstance(
                ClaimRepository.class.getClassLoader(),
                new Class[]{ClaimRepository.class},
                (proxy, method, args) -> {
                    if ("findSkillClaimByProfileAndRawValue".equals(method.getName())) {
                        String rawValue = (String) args[1];
                        return Optional.ofNullable(byRawLower.get(rawValue.toLowerCase(Locale.ROOT)));
                    }
                    if ("save".equals(method.getName())) {
                        Claim claim = (Claim) args[0];
                        byRawLower.put(claim.getRawValue().toLowerCase(Locale.ROOT), claim);
                        savedClaims.add(claim);
                        return claim;
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private SkillRepository skillRepository(
            Map<String, Skill> namesByLower,
            Map<String, Skill> aliasesByLower
    ) {
        return (SkillRepository) Proxy.newProxyInstance(
                SkillRepository.class.getClassLoader(),
                new Class[]{SkillRepository.class},
                (proxy, method, args) -> {
                    if ("findByNameIgnoreCase".equals(method.getName())) {
                        String name = (String) args[0];
                        return Optional.ofNullable(namesByLower.get(name.toLowerCase(Locale.ROOT)));
                    }
                    if ("findByAliasIgnoreCase".equals(method.getName())) {
                        String alias = (String) args[0];
                        return Optional.ofNullable(aliasesByLower.get(alias.toLowerCase(Locale.ROOT)));
                    }
                    if ("findAliasesBySkillId".equals(method.getName())) {
                        return List.of();
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ResumeVerificationRepository resumeVerificationRepository(UUID profileId, UUID resumeVerificationId) {
        ResumeVerification resumeVerification = new ResumeVerification();
        resumeVerification.setId(resumeVerificationId);
        resumeVerification.setProfile(profile(profileId));
        resumeVerification.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        resumeVerification.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));

        return (ResumeVerificationRepository) Proxy.newProxyInstance(
                ResumeVerificationRepository.class.getClassLoader(),
                new Class[]{ResumeVerificationRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        return Optional.of(resumeVerification);
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    @SuppressWarnings("unchecked")
    private ProfileRepository profileRepository(UUID profileId) {
        Profile profile = profile(profileId);
        return (ProfileRepository) Proxy.newProxyInstance(
                ProfileRepository.class.getClassLoader(),
                new Class[]{ProfileRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        return Optional.of(profile);
                    }
                    return handleObjectMethod(proxy, method.getName(), args);
                }
        );
    }

    private ClaimEvidenceReadService emptyEvidenceReadService() {
        return (profileId, claimIds) -> Map.of();
    }

    private Skill skill(UUID id, String name) {
        Skill skill = new Skill();
        skill.setId(id);
        skill.setName(name);
        skill.setCategory("engineering");
        skill.setWeight(new BigDecimal("1.0"));
        skill.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        skill.setUpdatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        return skill;
    }

    private Profile profile(UUID id) {
        Profile profile = new Profile();
        profile.setId(id);
        return profile;
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
