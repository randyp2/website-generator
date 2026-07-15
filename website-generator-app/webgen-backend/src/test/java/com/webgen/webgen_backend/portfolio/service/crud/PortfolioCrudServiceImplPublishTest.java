package com.webgen.webgen_backend.portfolio.service.crud;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.crud.PublishRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.PublishResponseDTO;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.mapper.AssetMapper;
import com.webgen.webgen_backend.portfolio.mapper.PortfolioMapper;
import com.webgen.webgen_backend.portfolio.repository.AssetRepository;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.portfolio.service.verification.SiteOwnershipPublishGuard;
import com.webgen.webgen_backend.portfolio.service.version.VersionSnapshotReader;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import com.webgen.webgen_backend.resume.mapper.ResumeMapper;
import com.webgen.webgen_backend.resume.repository.ResumeRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PortfolioCrudServiceImplPublishTest {

    private static final String EXTERNAL_URL = "https://8.8.8.8/portfolio";

    @Test
    void persistsVerificationThatAuthorizedExternalPublish() {
        UUID userId = UUID.randomUUID();
        UUID verificationId = UUID.randomUUID();
        PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
        SiteOwnershipPublishGuard publishGuard =
                mock(SiteOwnershipPublishGuard.class);
        when(publishGuard.requireVerified(
                userId,
                verificationId,
                EXTERNAL_URL
        )).thenReturn(verificationId);
        when(portfolioRepository.save(any(Portfolio.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PortfolioCrudServiceImpl service = service(
                portfolioRepository,
                publishGuard
        );
        PublishRequestDTO request = new PublishRequestDTO();
        request.setSourceType(PublishRequestDTO.SourceType.EXTERNAL);
        request.setExternalUrl(EXTERNAL_URL);
        request.setSiteVerificationId(verificationId);
        request.setSlug("verified-portfolio");

        PublishResponseDTO result = service.publishPortfolio(userId, request);

        ArgumentCaptor<Portfolio> portfolioCaptor =
                ArgumentCaptor.forClass(Portfolio.class);
        verify(portfolioRepository).save(portfolioCaptor.capture());
        Portfolio saved = portfolioCaptor.getValue();
        assertThat(saved.getSiteVerificationId()).isEqualTo(verificationId);
        assertThat(saved.getExternalUrl()).isEqualTo(EXTERNAL_URL);
        assertThat(result.getPortfolioId()).isEqualTo(saved.getId().toString());
    }

    private PortfolioCrudServiceImpl service(
            PortfolioRepository portfolioRepository,
            SiteOwnershipPublishGuard publishGuard
    ) {
        return new PortfolioCrudServiceImpl(
                portfolioRepository,
                mock(ResumeRepository.class),
                mock(AssetRepository.class),
                mock(GeneratedVersionRepository.class),
                mock(PortfolioSectionRepository.class),
                mock(ProfileRepository.class),
                mock(PortfolioMapper.class),
                mock(ResumeMapper.class),
                mock(AssetMapper.class),
                mock(RabbitTemplate.class),
                new ObjectMapper(),
                mock(VersionSnapshotReader.class),
                publishGuard
        );
    }
}
