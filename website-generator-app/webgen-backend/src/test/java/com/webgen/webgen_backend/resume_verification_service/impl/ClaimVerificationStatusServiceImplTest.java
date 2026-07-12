package com.webgen.webgen_backend.resume_verification_service.impl;

import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.verification.entity.Claim;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceLink;
import com.webgen.webgen_backend.verification.entity.Evidence;
import com.webgen.webgen_backend.verification.repository.ClaimEvidenceLinkRepository;
import com.webgen.webgen_backend.verification.repository.ClaimRepository;
import com.webgen.webgen_backend.verification.repository.EvidenceRepository;
import com.webgen.webgen_backend.verification.service.impl.ClaimVerificationStatusServiceImpl;
import com.webgen.webgen_backend.verification.service.scoring.VerificationSignalPolicy;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ClaimVerificationStatusServiceImplTest {

    @Test
    void descriptionDiscoveryDoesNotCorroborateClaim() {
        assertThat(reconcileWithLinkType("description_match")).isEqualTo("needs_evidence");
    }

    @Test
    void nameDiscoveryDoesNotCorroborateClaim() {
        assertThat(reconcileWithLinkType("name_match")).isEqualTo("needs_evidence");
    }

    @Test
    void topicDiscoveryDoesNotCorroborateClaim() {
        assertThat(reconcileWithLinkType("topic_match")).isEqualTo("needs_evidence");
    }

    @Test
    void substantiveConnectorSignalCorroboratesClaim() {
        assertThat(reconcileWithLinkType("dependency_match")).isEqualTo("corroborated");
    }

    private String reconcileWithLinkType(String linkType) {
        UUID profileId = UUID.randomUUID();
        UUID claimId = UUID.randomUUID();
        UUID evidenceId = UUID.randomUUID();
        Profile profile = new Profile();
        profile.setId(profileId);
        Claim claim = Claim.builder()
                .id(claimId)
                .profile(profile)
                .claimType("skill")
                .rawValue("React")
                .canonicalSkillId(UUID.randomUUID())
                .source("resume")
                .status("pending")
                .build();
        ClaimEvidenceLink link = ClaimEvidenceLink.builder()
                .id(UUID.randomUUID())
                .profile(profile)
                .claimId(claimId)
                .evidenceId(evidenceId)
                .linkType(linkType)
                .linkConfidence(new BigDecimal("0.90"))
                .build();
        Evidence evidence = Evidence.builder()
                .id(evidenceId)
                .profile(profile)
                .provider("github")
                .externalId("repo:test")
                .evidenceGroupKey("github:repository:test")
                .evidenceType("repository")
                .capturedAt(OffsetDateTime.now())
                .build();

        ClaimVerificationStatusServiceImpl service = new ClaimVerificationStatusServiceImpl(
                claimRepository(claim), linkRepository(link), evidenceRepository(evidence),
                new VerificationSignalPolicy());
        service.reconcileProfile(profileId);
        return claim.getStatus();
    }

    private ClaimRepository claimRepository(Claim claim) {
        return repositoryProxy(ClaimRepository.class, (methodName, args) -> switch (methodName) {
            case "findSkillClaimsByProfileId" -> List.of(claim);
            case "saveAll" -> args[0];
            default -> null;
        });
    }

    private ClaimEvidenceLinkRepository linkRepository(ClaimEvidenceLink link) {
        return repositoryProxy(ClaimEvidenceLinkRepository.class, (methodName, args) ->
                "findByProfileIdAndClaimIdIn".equals(methodName) ? List.of(link) : null);
    }

    private EvidenceRepository evidenceRepository(Evidence evidence) {
        return repositoryProxy(EvidenceRepository.class, (methodName, args) ->
                "findAllById".equals(methodName) ? List.of(evidence) : null);
    }

    @SuppressWarnings("unchecked")
    private <T> T repositoryProxy(Class<T> type, RepositoryInvocation invocation) {
        return (T) Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class[]{type},
                (proxy, method, args) -> {
                    Object result = invocation.invoke(method.getName(), args);
                    if (result != null) {
                        return result;
                    }
                    return switch (method.getName()) {
                        case "toString" -> "repositoryProxy";
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "equals" -> proxy == args[0];
                        default -> throw new UnsupportedOperationException(
                                "Unexpected repository method invocation: " + method.getName());
                    };
                });
    }

    @FunctionalInterface
    private interface RepositoryInvocation {
        Object invoke(String methodName, Object[] args);
    }
}
