package com.webgen.webgen_backend.portfolio_service.pub.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.dto.portfolio.GlobalThemeDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
import com.webgen.webgen_backend.dto.portfolio.pub.PublicPortfolioDTO;
import com.webgen.webgen_backend.dto.portfolio.pub.PublicSectionDTO;
import com.webgen.webgen_backend.entity.GeneratedVersion;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.entity.PortfolioSection;
import com.webgen.webgen_backend.entity.Profile;
import com.webgen.webgen_backend.portfolio_service.export.PortfolioHtmlExportService;
import com.webgen.webgen_backend.portfolio_service.pub.PublicPortfolioService;
import com.webgen.webgen_backend.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import com.webgen.webgen_backend.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        dto.setTitle(portfolio.getTitle());
        dto.setSlug(portfolio.getSlug());
        dto.setTemplateId(portfolio.getTemplateId());
        dto.setSections(sectionDTOs);
        dto.setGlobalTheme(globalTheme);
        dto.setOwnerName(ownerName);
        dto.setOwnerAvatarUrl(ownerAvatarUrl);
        dto.setPublishedAt(portfolio.getUpdatedAt());

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
}
