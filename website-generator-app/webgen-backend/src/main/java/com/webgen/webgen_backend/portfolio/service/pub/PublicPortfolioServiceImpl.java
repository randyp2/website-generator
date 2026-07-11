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
import com.webgen.webgen_backend.portfolio.service.version.VersionSnapshotReader;
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
    private final VersionSnapshotReader versionSnapshotReader;

    @Override
    public Optional<PublicPortfolioDTO> getBySlug(String slug) {
        Optional<Portfolio> portfolioOpt = portfolioRepository.findBySlugAndStatus(slug, "publish");
        if (portfolioOpt.isEmpty()) {
            return Optional.empty();
        }

        Portfolio portfolio = portfolioOpt.get();

        // Serve the pinned published version so in-editor refinements stay
        // private until the user publishes them
        List<SectionDTO> servedSections = resolveServedSections(portfolio);

        List<PublicSectionDTO> sectionDTOs = servedSections.stream().map(section -> {
            PublicSectionDTO dto = new PublicSectionDTO();
            dto.setSectionKey(section.getSectionKey());
            dto.setTitle(section.getTitle());
            dto.setOrderIndex(section.getOrderIndex());
            dto.setContentJson(section.getContentJson());
            dto.setReactSource(section.getReactSource());
            return dto;
        }).toList();

        com.fasterxml.jackson.databind.JsonNode globalTheme = resolveServedTheme(portfolio);

        // Load owner profile
        String ownerName = null;
        String ownerAvatarUrl = null;
        String ownerUsername = null;
        Optional<Profile> profileOpt = profileRepository.findById(portfolio.getUserId());
        if (profileOpt.isPresent()) {
            Profile profile = profileOpt.get();
            ownerName = profile.getFullName();
            ownerAvatarUrl = profile.getAvatarUrl();
            ownerUsername = profile.getUsername();
        }

        PublicPortfolioDTO dto = new PublicPortfolioDTO();
        dto.setPortfolioId(portfolio.getId().toString());
        dto.setUserId(portfolio.getUserId().toString());
        dto.setOwnerUsername(ownerUsername);
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

        List<SectionDTO> sectionDTOs = resolveServedSections(portfolio);
        if (sectionDTOs.isEmpty()) return Optional.empty();

        com.fasterxml.jackson.databind.JsonNode themeNode = resolveServedTheme(portfolio);
        GlobalThemeDTO globalTheme = themeNode != null
                ? objectMapper.convertValue(themeNode, GlobalThemeDTO.class)
                : null;

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
            card.setOwnerUsername(profile.getUsername());
            card.setOwnerAvatarUrl(profile.getAvatarUrl());
        });

        return card;
    }

    /*
     * Sections shown to visitors: the pinned published version's snapshot when
     * one exists, otherwise the live sections. The live fallback keeps
     * portfolios published before pinning existed (null pin) rendering, and
     * covers a pinned version whose snapshot is unreadable.
     */
    private List<SectionDTO> resolveServedSections(Portfolio portfolio) {
        if (portfolio.getPublishedVersionId() != null) {
            List<SectionDTO> pinned = generatedVersionRepository
                    .findById(portfolio.getPublishedVersionId())
                    .map(versionSnapshotReader::readSections)
                    .orElse(List.of());
            if (!pinned.isEmpty())
                return pinned;
        }

        return portfolioSectionRepository
                .findAllByPortfolioIdOrderByOrderIndexAsc(portfolio.getId())
                .stream()
                .map(section -> {
                    SectionDTO dto = new SectionDTO();
                    dto.setSectionKey(section.getSectionKey());
                    dto.setTitle(section.getTitle());
                    dto.setOrderIndex(section.getOrderIndex());
                    dto.setContentJson(section.getContentJson());
                    dto.setReactSource(section.getReactSource());
                    return dto;
                })
                .toList();
    }

    /* Theme paired with the served sections: pinned version first, then active. */
    private com.fasterxml.jackson.databind.JsonNode resolveServedTheme(Portfolio portfolio) {
        UUID themeVersionId = portfolio.getPublishedVersionId() != null
                ? portfolio.getPublishedVersionId()
                : portfolio.getActiveVersionId();
        if (themeVersionId == null)
            return null;

        return generatedVersionRepository.findById(themeVersionId)
                .map(GeneratedVersion::getGlobalTheme)
                .orElse(null);
    }
}
