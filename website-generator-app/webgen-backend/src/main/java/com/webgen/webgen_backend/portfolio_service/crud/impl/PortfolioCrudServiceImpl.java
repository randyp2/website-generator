package com.webgen.webgen_backend.portfolio_service.crud.impl;

import com.webgen.webgen_backend.config.RabbitMQConfig;
import com.webgen.webgen_backend.dto.portfolio.AssetDTO;
import com.webgen.webgen_backend.dto.portfolio.ResumeDTO;
import com.webgen.webgen_backend.dto.portfolio.SectionDTO;
import com.webgen.webgen_backend.dto.portfolio.crud.*;
import com.webgen.webgen_backend.entity.Asset;
import com.webgen.webgen_backend.entity.GeneratedVersion;
import com.webgen.webgen_backend.entity.Portfolio;
import com.webgen.webgen_backend.entity.PortfolioSection;
import com.webgen.webgen_backend.entity.Resume;
import com.webgen.webgen_backend.mapper.AssetMapper;
import com.webgen.webgen_backend.mapper.PortfolioMapper;
import com.webgen.webgen_backend.mapper.ResumeMapper;
import com.webgen.webgen_backend.portfolio_service.crud.PortfolioCrudService;
import com.webgen.webgen_backend.portfolio_service.job.ScreenshotMessage;
import com.webgen.webgen_backend.repository.AssetRepository;
import com.webgen.webgen_backend.repository.GeneratedVersionRepository;
import com.webgen.webgen_backend.repository.PortfolioRepository;
import com.webgen.webgen_backend.repository.PortfolioSectionRepository;
import com.webgen.webgen_backend.repository.ProfileRepository;
import com.webgen.webgen_backend.repository.ResumeRepository;
import com.webgen.webgen_backend.util.ExternalUrlSafetyValidator;
import com.webgen.webgen_backend.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioCrudServiceImpl implements PortfolioCrudService {

    private final PortfolioRepository portfolioRepository;
    private final ResumeRepository resumeRepository;
    private final AssetRepository assetRepository;
    private final GeneratedVersionRepository generatedVersionRepository;
    private final PortfolioSectionRepository portfolioSectionRepository;
    private final ProfileRepository profileRepository;

    private final PortfolioMapper portfolioMapper;

    private final ResumeMapper resumeMapper;
    private final AssetMapper assetMapper;

    private final RabbitTemplate rabbitTemplate;

    private static final int MAX_PORTFOLIO_DESCRIPTION_LENGTH = 1000;

    @Override
    public PortfolioListDTO listPortfolios(UUID userId) {
        List<PortfolioDTO> portfolios = portfolioRepository.findByUserId(userId)
                .stream()
                .map(portfolioMapper::toDto)
                .toList();

        PortfolioListDTO response = new PortfolioListDTO();
        response.setPortfolios(portfolios);

        return response;
    }

    @Override
    public PortfolioDetailDTO getPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        ResumeDTO resume = resumeRepository.findByPortfolioId(portfolioId)
                .map(resumeMapper::toDto)
                .orElse(null);

        List<AssetDTO> assets = assetRepository.findByPortfolioId(portfolioId)
                .stream().map(assetMapper::toDto).toList();

        PortfolioDetailDTO response = new PortfolioDetailDTO();
        response.setPortfolio(portfolioMapper.toDto(portfolio));
        response.setResume(resume);
        response.setAssets(assets);
        return response;
    }

    @Override
    public PortfolioDTO createDraft(UUID userId, CreatePortfolioRequestDTO request) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setUserId(userId);
        portfolio.setTitle("Untitled Portfolio");
        portfolio.setTemplateId(request.getTemplateId());
        portfolio.setStatus("draft");
        portfolio.setLastStep("style");
        portfolio.setStyleChatHistory(new ArrayList<>());
        portfolio.setSourceType(PublishRequestDTO.SourceType.GENERATED.name());

        Portfolio saved = portfolioRepository.save(portfolio);
        return portfolioMapper.toDto(saved);
    }

    @Override
    public PortfolioDTO updatePortfolio(UUID userId, UUID portfolioId, UpdatePortfolioRequestDTO request) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        if (request.getTitle() != null)
            portfolio.setTitle(request.getTitle());
        if (request.getLastStep() != null)
            portfolio.setLastStep(request.getLastStep());
        if (request.getTemplateId() != null)
            portfolio.setTemplateId(request.getTemplateId());
        if (request.getStyleChatHistory() != null)
            portfolio.setStyleChatHistory(request.getStyleChatHistory());
        if (request.getDescription() != null)
            portfolio.setDescription(normalizeDescription(request.getDescription()));

        Portfolio saved = portfolioRepository.save(portfolio);
        return portfolioMapper.toDto(saved);
    }

    @Override
    public void deletePortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        portfolioRepository.deleteById(portfolioId);
    }

    @Override
    public UploadPortfolioResponseDTO saveUploads(UUID userId, UUID portfolioId, UploadPortfolioRequestDTO req) {
        // Ownership check
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        // Upsert resume (safe for re-uploads)
        Resume resume = resumeRepository.findByPortfolioId(portfolioId).orElse(new Resume());
        if (resume.getId() == null) {
            resume.setId(UUID.randomUUID());
            resume.setPortfolio(portfolio);
            resume.setCreatedAt(OffsetDateTime.now());
        }
        resume.setRawFileUrl(req.getResumeRawFileUrl());
        resumeRepository.save(resume);

        // Insert assets
        OffsetDateTime now = OffsetDateTime.now();
        List<Asset> savedAssets = new ArrayList<>();
        if (req.getAssets() != null) {
            for (AssetDTO assetDto : req.getAssets()) {
                Asset asset = new Asset();
                asset.setId(UUID.randomUUID());
                asset.setPortfolio(portfolio);
                asset.setFileUrl(assetDto.getUrl());
                asset.setFileType(assetDto.getType());
                asset.setTitle(assetDto.getTitle());
                asset.setDescription(assetDto.getDescription());
                asset.setLabel(assetDto.getLabel());
                asset.setSectionHint(assetDto.getSectionHint());
                asset.setAlt(assetDto.getAlt());
                asset.setCreatedAt(now);
                savedAssets.add(assetRepository.save(asset));
            }
        }

        // Update optional portfolio fields
        if (req.getTemplateId() != null)
            portfolio.setTemplateId(req.getTemplateId());
        if (req.getLastStep() != null)
            portfolio.setLastStep(req.getLastStep());
        Portfolio saved = portfolioRepository.save(portfolio);

        // Build response
        UploadPortfolioResponseDTO response = new UploadPortfolioResponseDTO();
        response.setPortfolio(portfolioMapper.toDto(saved));
        response.setResume(resumeMapper.toDto(resume));
        response.setAssetsUploaded(savedAssets.size());
        return response;
    }

    @Override
    public ResumeDTO updateResume(UUID userId, UUID portfolioId, UpdateResumeRequestDTO req) {

        // Ownership check
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        Resume resume = resumeRepository.findByPortfolioId(portfolioId).orElse(new Resume());
        if (resume.getId() == null) {
            resume.setId(UUID.randomUUID());
            resume.setPortfolio(portfolio);
            resume.setCreatedAt(OffsetDateTime.now());
        }
        resume.setParsedJson(req.getParsedJson());
        resume.setExtractedText(req.getExtractedText());

        return resumeMapper.toDto(resumeRepository.save(resume));
    }

    @Override
    public ResumeDTO getResume(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        Resume resume = resumeRepository.findByPortfolioId(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found"));
        return resumeMapper.toDto(resume);
    }

    @Override
    public PortfolioLoadResponseDTO loadPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        // Load globalTheme and assistantMessage from the active version if present
        com.fasterxml.jackson.databind.JsonNode globalTheme = null;
        com.fasterxml.jackson.databind.JsonNode assistantMessage = null;
        if (portfolio.getActiveVersionId() != null) {
            GeneratedVersion version = generatedVersionRepository.findById(portfolio.getActiveVersionId())
                    .orElse(null);
            if (version != null) {
                globalTheme = version.getGlobalTheme();
                assistantMessage = version.getAssistantMessage();
            }
        }

        // Load sections ordered by orderIndex
        List<SectionDTO> sections = portfolioSectionRepository
                .findAllByPortfolioIdOrderByOrderIndexAsc(portfolioId)
                .stream()
                .map(s -> {
                    SectionDTO dto = new SectionDTO();
                    dto.setSectionKey(s.getSectionKey());
                    dto.setTitle(s.getTitle());
                    dto.setOrderIndex(s.getOrderIndex());
                    dto.setContentJson(s.getContentJson());
                    dto.setReactSource(s.getReactSource());
                    return dto;
                })
                .toList();

        PortfolioLoadResponseDTO response = new PortfolioLoadResponseDTO();
        response.setPortfolioId(portfolio.getId().toString());
        response.setTemplateId(portfolio.getTemplateId());
        response.setTitle(portfolio.getTitle());
        response.setSections(sections);
        response.setGlobalTheme(globalTheme);
        response.setAssistantMessage(assistantMessage);
        return response;
    }

    @Override
    public VersionListResponseDTO listVersions(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        List<VersionDTO> versions = generatedVersionRepository
                .findByPortfolio_IdOrderByCreatedAtDesc(portfolioId)
                .stream()
                .map(v -> {
                    VersionDTO dto = new VersionDTO();
                    dto.setId(v.getId());
                    dto.setCreatedAt(v.getCreatedAt());
                    dto.setAssistantMessage(v.getAssistantMessage());
                    dto.setPromptUsed(v.getPromptUsed());
                    dto.setPreviewUrl(v.getPreviewUrl());
                    dto.setActive(v.getId().equals(portfolio.getActiveVersionId()));
                    return dto;
                })
                .toList();

        VersionListResponseDTO response = new VersionListResponseDTO();
        response.setVersions(versions);
        return response;
    }

    @Override
    public void verifyOwnership(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    @Override
    public ActivateVersionResponseDTO activateVersion(UUID userId, UUID portfolioId, UUID versionId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        generatedVersionRepository.findByIdAndPortfolio_Id(versionId, portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));

        portfolio.setActiveVersionId(versionId);
        portfolio.setUpdatedAt(OffsetDateTime.now());
        portfolioRepository.save(portfolio);

        return new ActivateVersionResponseDTO(portfolioId, versionId);
    }

    @Override
    public PublishResponseDTO publishPortfolio(UUID userId, PublishRequestDTO request) {
        request = Objects.requireNonNull(request, "request must not be null");

        // Default to GENERATED if empty request
        PublishRequestDTO.SourceType sourceType = request.getSourceType() != null
                ? request.getSourceType()
                : PublishRequestDTO.SourceType.GENERATED;

        if (sourceType == PublishRequestDTO.SourceType.EXTERNAL) {
            return publishExternalPortfolio(userId, request);
        }

        return publishGeneratedPortfolio(userId, request);
    }

    /**
     * Publishes an existing generated portfolio.
     *
     * @param userId  authenticated user id used for ownership checks
     * @param request publish request containing generated portfolio metadata
     * @return publish response containing slug/status/source metadata
     */
    private PublishResponseDTO publishGeneratedPortfolio(UUID userId, PublishRequestDTO request) {
        // Required portfolioId
        // - Generated portfolios should already have a row in portfolios
        UUID portfolioId = parsePortfolioId(request.getPortfolioId());

        // Ownership check
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));
        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        // Check for sections to publish
        List<PortfolioSection> sections = portfolioSectionRepository
                .findAllByPortfolioIdOrderByOrderIndexAsc(portfolioId);
        if (sections.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot publish portfolio w/ no sections");

        // Resolve slug
        String slug = resolveSlug(userId, request.getSlug(), portfolio.getSlug(), portfolio.getTitle());

        if (request.getDescription() != null) {
            portfolio.setDescription(normalizeDescription(request.getDescription()));
        }

        // Update portfolio metadata
        portfolio.setSlug(slug);
        portfolio.setSourceType(PublishRequestDTO.SourceType.GENERATED.name());
        portfolio.setExternalUrl(null);
        portfolio.setStatus("publish");
        portfolio.setLastStep("publish");
        portfolio.setUpdatedAt(OffsetDateTime.now()); // last publish date
        portfolioRepository.save(portfolio);

        queueScreenshotJob(portfolio.getId(), slug, null);
        return buildPublishResponse(portfolio, PublishRequestDTO.SourceType.GENERATED);
    }

    /**
     * Publishes an external portfolio by creating a new portfolio row.
     *
     * @param userId  authenticated user id that will own the new portfolio row
     * @param request publish request containing external portfolio metadata
     * @return publish response containing slug/status/source metadata
     */
    private PublishResponseDTO publishExternalPortfolio(UUID userId, PublishRequestDTO request) {
        String normalizedExternalUrl;
        try {
            normalizedExternalUrl = ExternalUrlSafetyValidator
                    .normalizeAndValidateExternalUrl(request.getExternalUrl());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        String requestedTitle = request.getTitle() != null ? request.getTitle().trim() : "";
        String title = requestedTitle.isBlank() ? "External Portfolio" : requestedTitle;

        // Resolve slug
        String slug = resolveSlug(userId, request.getSlug(), null, title);

        Portfolio portfolio = new Portfolio();
        portfolio.setId(UUID.randomUUID());
        portfolio.setUserId(userId);
        portfolio.setTitle(title);
        portfolio.setTemplateId(null);
        portfolio.setStatus("publish");
        portfolio.setSlug(slug);
        portfolio.setLastStep("publish");
        portfolio.setStyleChatHistory(new ArrayList<>());
        portfolio.setDescription(normalizeDescription(request.getDescription()));
        portfolio.setSourceType(PublishRequestDTO.SourceType.EXTERNAL.name());
        portfolio.setExternalUrl(normalizedExternalUrl);

        OffsetDateTime now = OffsetDateTime.now();
        portfolio.setCreatedAt(now);
        portfolio.setUpdatedAt(now);

        // Save external portfolio as a new row
        Portfolio saved = portfolioRepository.save(portfolio);

        // Queue screenshot message
        // - For external publish we use targetUrl to capture remote website
        queueScreenshotJob(saved.getId(), saved.getSlug(), saved.getExternalUrl());

        return buildPublishResponse(saved, PublishRequestDTO.SourceType.EXTERNAL);
    }

    /**
     * Resolves a publish slug by validating a request slug or generating one.
     *
     * @param userId user id used for profile based slug generation fallback
     * @param requestedSlug slug requested by user (nullable)
     * @param ownedSlug existing slug already owned by portfolio (nullable)
     * @param fallbackTitle fallback title when auto-generating slugs
     * @return resolved unique slug for portfolio publishing
     */
    private String resolveSlug(
            UUID userId,
            String requestedSlug,
            String ownedSlug,
            String fallbackTitle
    ) {
        // Resolve slug
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            String slug = requestedSlug.trim().toLowerCase();
            if (!SlugUtil.isValid(slug))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid slug format");

            // Allow re-publishing with the same slug the portfolio already owns
            boolean slugTaken = portfolioRepository.existsBySlug(slug);
            boolean ownSlug = ownedSlug != null && slug.equals(ownedSlug);
            if (slugTaken && !ownSlug)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug is already taken");

            return slug;
        }

        // Auto-generate from profile name or portfolio title
        String baseName = profileRepository.findById(userId)
                .map(p -> p.getFullName())
                .orElse(fallbackTitle);

        if (baseName == null || baseName.isBlank()) {
            baseName = "portfolio";
        }
        return generateUniqueSlug(baseName);
    }

    /**
     * Parses and validates a portfolio id from publish request.
     *
     * @param rawPortfolioId portfolio id as a string
     * @return parsed UUID portfolio id
     */
    private UUID parsePortfolioId(String rawPortfolioId) {
        if (rawPortfolioId == null || rawPortfolioId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "portfolioId is required for generated publish");
        }

        try {
            return UUID.fromString(rawPortfolioId.trim());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid portfolioId format");
        }
    }

    /**
     * Queues screenshot generation for generated or external portfolios.
     *
     * @param portfolioId portfolio id associated with screenshot
     * @param slug publish slug associated with screenshot
     * @param targetUrl external url for capture, null when using internal slug route
     */
    private void queueScreenshotJob(UUID portfolioId, String slug, String targetUrl) {
        ScreenshotMessage screenshotMsg = new ScreenshotMessage(
                UUID.randomUUID().toString(),
                portfolioId.toString(),
                slug,
                targetUrl
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.SCREENSHOT_ROUTING_KEY,
                screenshotMsg
        );
    }

    /**
     * Builds a standardized publish response for generated and external sources.
     *
     * @param portfolio persisted portfolio entity
     * @param sourceType publish source type associated with this response
     * @return DTO returned to publish API callers
     */
    private PublishResponseDTO buildPublishResponse(Portfolio portfolio, PublishRequestDTO.SourceType sourceType) {
        return new PublishResponseDTO(
                portfolio.getId().toString(),
                portfolio.getSlug(),
                "publish",
                sourceType,
                portfolio.getExternalUrl()
        );
    }

    @Override
    public void unpublishPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found"));

        if (!portfolio.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        portfolio.setStatus("draft");
        portfolio.setSlug(null);
        portfolio.setScreenshotUrl(null);
        portfolio.setUpdatedAt(OffsetDateTime.now());
        portfolioRepository.save(portfolio);
    }

    private String normalizeDescription(String rawDescription) {
        if (rawDescription == null) return null;

        String normalized = rawDescription.trim();
        if (normalized.isEmpty()) return null;

        if (normalized.length() > MAX_PORTFOLIO_DESCRIPTION_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Description exceeds max length of " + MAX_PORTFOLIO_DESCRIPTION_LENGTH + " characters");
        }

        return normalized;
    }

    private String generateUniqueSlug(String baseName) {
        for (int attempt = 0; attempt < 5; attempt++) {
            String slug = SlugUtil.generateSlug(baseName);
            if (!portfolioRepository.existsBySlug(slug))
                return slug;
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Could not generate a unique slug, please provide one manually");
    }
}
