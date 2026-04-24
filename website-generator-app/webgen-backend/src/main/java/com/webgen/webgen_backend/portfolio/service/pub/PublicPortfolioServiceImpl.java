package com.webgen.webgen_backend.portfolio.service.pub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.GlobalThemeDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioCardDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicPortfolioDTO;
import com.webgen.webgen_backend.portfolio.dto.pub.PublicSectionDTO;
import com.webgen.webgen_backend.portfolio.entity.GeneratedVersion;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.entity.PortfolioSection;
import com.webgen.webgen_backend.profile.entity.Profile;
import com.webgen.webgen_backend.portfolio.service.export.PortfolioHtmlExportService;
import com.webgen.webgen_backend.portfolio.service.pub.PublicPortfolioService;
import com.webgen.webgen_backend.portfolio.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicPortfolioServiceImpl implements PublicPortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioSectionRepository portfolioSectionRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final ProfileRepository profileRepository;
    private final PortfolioHtmlExportService htmlExportService;
    private final ObjectMapper objectMapper;

    @Override
    public Optional<PublicPortfolioDTO> getBySlug(String slug) {
        Optional<Portfolio> portfolioOpt = portfolioRepository.findBySlugAndStatus(slug, "publish");
        if (portfolioOpt.isEmpty()) {
            return Optional.empty();
        }

        Portfolio portfolio = portfolioOpt.get();

        List<PortfolioSection> sections = portfolioSectionRepository
                .findAllByPortfolioIdOrderByOrderIndexAsc(portfolio.getId());

        List<PublicSectionDTO> sectionDTOs = sections.stream().map(section -> {
            PublicSectionDTO dto = new PublicSectionDTO();
            dto.setSectionKey(section.getSectionKey());
            dto.setTitle(section.getTitle());
            dto.setOrderIndex(section.getOrderIndex());
            dto.setContentJson(section.getContentJson());
            dto.setReactSource(section.getReactSource());
            return dto;
        }).toList();

        // Load global theme from active version if one exists
        com.fasterxml.jackson.databind.JsonNode globalTheme = null;
        if (portfolio.getActiveVersionId() != null) {
            Optional<GeneratedVersion> versionOpt = generatedVersionRepository
                    .findById(portfolio.getActiveVersionId());
            if (versionOpt.isPresent()) {
                globalTheme = versionOpt.get().getGlobalTheme();
            }
        }

        // Load owner profile
        String ownerName = null;
        String ownerAvatarUrl = null;
        Optional<Profile> profileOpt = profileRepository.findById(portfolio.getUserId());
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            ownerName = profile.getFullName();
            ownerAvatarUrl = profile.getAvatarUrl();
        }

        PublicPortfolioDTO dto = new PublicPortfolioDTO();
        dto.setPortfolioId(portfolio.getId().toString());
        dto.setUserId(portfolio.getUserId().toString());
        dto.setTitle(portfolio.getTitle());
        dto.setSlug(portfolio.getSlug());
        dto.setTemplateId(portfolio.getTemplateId());
        dto.setDescription(portfolio.getDescription());
        dto.setSourceType(portfolio.getSourceType());
        dto.setExternalUrl(portfolio.getExternalUrl());
        dto.setSections(sectionDTOs);
        dto.setGlobalTheme(globalTheme);
        dto.setOwnerName(ownerName);
        dto.setOwnerAvatarUrl(ownerAvatarUrl);
        dto.setPublishedAt(portfolio.getUpdatedAt());
        dto.setScreenshotUrl(portfolio.getScreenshotUrl());

        return Optional.of(dto);
    }

    @Override
    public Optional<String> getHtmlBySlug(String slug) {
        Optional<Portfolio> portfolioOpt = portfolioRepository.findBySlugAndStatus(slug, "publish");
        if (portfolioOpt.isEmpty()) return Optional.empty();

        Portfolio portfolio = portfolioOpt.get();

        List<PortfolioSection> sections = portfolioSectionRepository
                .findAllByPortfolioIdOrderByOrderIndexAsc(portfolio.getId());
        if (sections.isEmpty()) return Optional.empty();

        List<SectionDTO> sectionDTOs = sections.stream().map(s -> {
            SectionDTO dto = new SectionDTO();
            dto.setSectionKey(s.getSectionKey());
            dto.setTitle(s.getTitle());
            dto.setOrderIndex(s.getOrderIndex());
            dto.setContentJson(s.getContentJson());
            dto.setReactSource(s.getReactSource());
            return dto;
        }).toList();

        GlobalThemeDTO globalTheme = null;
        if (portfolio.getActiveVersionId() != null) {
            globalTheme = generatedVersionRepository.findById(portfolio.getActiveVersionId())
                    .map(v -> objectMapper.convertValue(v.getGlobalTheme(), GlobalThemeDTO.class))
                    .orElse(null);
        }

        String html = htmlExportService.generateHtml(sectionDTOs, globalTheme, portfolio.getTitle());
        return Optional.of(html);
    }

    @Override
    public Page<PublicPortfolioCardDTO> listPublished(Pageable pageable) {
        Page<Portfolio> portfolios = portfolioRepository.findByStatusAndSlugIsNotNull("publish", pageable);

        return portfolios.map(this::toPublicCard);
    }

    @Override
    public Page<PublicPortfolioCardDTO> listPublishedByUserId(UUID userId, Pageable pageable) {
        Page<Portfolio> portfolios = portfolioRepository.findByUserIdAndStatusAndSlugIsNotNull(
                userId,
                "publish",
                pageable
        );

        return portfolios.map(this::toPublicCard);
    }

    private PublicPortfolioCardDTO toPublicCard(Portfolio portfolio) {
        PublicPortfolioCardDTO card = new PublicPortfolioCardDTO();
        card.setTitle(portfolio.getTitle());
        card.setSlug(portfolio.getSlug());
        card.setTemplateId(portfolio.getTemplateId());
        card.setDescription(portfolio.getDescription());
        card.setSourceType(portfolio.getSourceType());
        card.setExternalUrl(portfolio.getExternalUrl());
        card.setPublishedAt(portfolio.getUpdatedAt());
        card.setScreenshotUrl(portfolio.getScreenshotUrl());

        profileRepository.findById(portfolio.getUserId()).ifPresent(profile -> {
            card.setOwnerName(profile.getFullName());
            card.setOwnerAvatarUrl(profile.getAvatarUrl());
        });

        return card;
    }
}
