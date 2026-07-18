package com.webgen.webgen_backend.portfolio.service.upload;

import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.portfolio.dto.crud.UploadPortfolioRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.crud.UploadPortfolioResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.CreatePortfolioUploadPresignRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.CreatePortfolioUploadPresignResponseDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadInstructionDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadedAssetDTO;
import com.webgen.webgen_backend.portfolio.entity.Asset;
import com.webgen.webgen_backend.portfolio.entity.Portfolio;
import com.webgen.webgen_backend.portfolio.mapper.PortfolioMapper;
import com.webgen.webgen_backend.portfolio.repository.AssetRepository;
import com.webgen.webgen_backend.portfolio.repository.PortfolioRepository;
import com.webgen.webgen_backend.resume.dto.ParsedResumeDTO;
import com.webgen.webgen_backend.resume.entity.Resume;
import com.webgen.webgen_backend.resume.mapper.ResumeMapper;
import com.webgen.webgen_backend.resume.repository.ResumeRepository;
import com.webgen.webgen_backend.resume.service.ResumeParserService;
import com.webgen.webgen_backend.shared.storage.SupabaseStorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Owns the direct-to-storage portfolio upload lifecycle. The service chooses
 * object paths, validates completed uploads, and only then persists references.
 */
@Service
@RequiredArgsConstructor
public class PortfolioUploadService {

    private final PortfolioRepository portfolioRepository;
    private final ResumeRepository resumeRepository;
    private final AssetRepository assetRepository;
    private final PortfolioMapper portfolioMapper;
    private final ResumeMapper resumeMapper;
    private final SupabaseStorageClient storageClient;
    private final PortfolioUploadPolicy uploadPolicy;
    private final ResumeParserService resumeParserService;
    private final AccountDeletionStateService accountDeletionStateService;

    /**
     * Validates a batch and creates one non-overwriting signed token per file.
     */
    public CreatePortfolioUploadPresignResponseDTO createUploadInstructions(
            UUID userId,
            UUID portfolioId,
            CreatePortfolioUploadPresignRequestDTO request
    ) {
        accountDeletionStateService.assertAccountActive(userId);
        requireOwnedPortfolio(userId, portfolioId);
        List<PortfolioUploadPolicy.NormalizedUpload> files = uploadPolicy.validatePresignBatch(
                request == null ? null : request.getFiles()
        );

        List<PortfolioUploadInstructionDTO> uploads = new ArrayList<>();
        for (PortfolioUploadPolicy.NormalizedUpload file : files) {
            String path = uploadPolicy.buildObjectPath(
                    portfolioId,
                    file.kind(),
                    file.extension()
            );
            SupabaseStorageClient.SignedUpload signedUpload = storageClient.createSignedUpload(
                    uploadPolicy.bucketFor(file.kind()),
                    path
            );
            uploads.add(PortfolioUploadInstructionDTO.builder()
                    .clientId(file.clientId())
                    .kind(file.kind())
                    .bucket(signedUpload.bucket())
                    .path(signedUpload.path())
                    .token(signedUpload.token())
                    .contentType(file.contentType())
                    .build());
        }
        return new CreatePortfolioUploadPresignResponseDTO(List.copyOf(uploads));
    }

    /**
     * Verifies every referenced storage object before atomically attaching it
     * to the existing portfolio draft.
     */
    @Transactional
    public UploadPortfolioResponseDTO finalizeUploads(
            UUID userId,
            UUID portfolioId,
            UploadPortfolioRequestDTO request
    ) {
        accountDeletionStateService.assertAccountActive(userId);
        Portfolio portfolio = requireOwnedPortfolio(userId, portfolioId);
        if (request == null) {
            throw badRequest("Upload details are required");
        }

        Resume resume = upsertResume(portfolio, request);
        List<PortfolioUploadedAssetDTO> assets = request.getAssets() == null
                ? List.of()
                : request.getAssets();
        uploadPolicy.validateAssetBatch(assets);

        int assetsUploaded = 0;
        for (PortfolioUploadedAssetDTO uploadedAsset : assets) {
            PortfolioUploadPolicy.ValidatedObject validated =
                    uploadPolicy.validateAssetObject(portfolioId, uploadedAsset);
            String publicUrl = storageClient.publicObjectUrl(
                    validated.bucket(),
                    validated.path()
            );
            if (assetRepository.existsByPortfolio_IdAndFileUrl(portfolioId, publicUrl)) {
                continue;
            }

            Asset asset = new Asset();
            asset.setId(UUID.randomUUID());
            asset.setPortfolio(portfolio);
            asset.setFileUrl(publicUrl);
            asset.setFileType(uploadedAsset.getKind().value());
            asset.setTitle(uploadedAsset.getTitle());
            asset.setDescription(uploadedAsset.getDescription());
            asset.setLabel(uploadedAsset.getLabel());
            asset.setSectionHint(uploadedAsset.getSectionHint());
            asset.setAlt(uploadedAsset.getAlt());
            asset.setCreatedAt(OffsetDateTime.now());
            assetRepository.save(asset);
            assetsUploaded += 1;
        }

        if (request.getTemplateId() != null) {
            portfolio.setTemplateId(request.getTemplateId());
        }
        if (request.getLastStep() != null) {
            portfolio.setLastStep(request.getLastStep());
        }
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);

        UploadPortfolioResponseDTO response = new UploadPortfolioResponseDTO();
        response.setPortfolio(portfolioMapper.toDto(savedPortfolio));
        response.setResume(resumeMapper.toDto(resume));
        response.setAssetsUploaded(assetsUploaded);
        return response;
    }

    /**
     * Downloads the finalized private resume after enforcing storage metadata
     * limits, then runs the existing parser without routing bytes through Next.js.
     */
    public ParsedResumeDTO parseStoredResume(
            UUID userId,
            UUID portfolioId,
            Boolean llmFallback
    ) {
        requireOwnedPortfolio(userId, portfolioId);
        Resume resume = resumeRepository.findByPortfolioId(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Resume not found"
                ));
        PortfolioUploadPolicy.ValidatedObject validated = uploadPolicy.validateResumeObject(
                portfolioId,
                resume.getRawFileBucket(),
                resume.getRawFilePath()
        );
        byte[] content = storageClient.downloadObject(validated.bucket(), validated.path());
        if (content.length == 0 || content.length > uploadPolicy.maxResumeBytes()) {
            throw badRequest("Stored resume has an invalid size");
        }

        return resumeParserService.parseResume(
                content,
                fileName(validated.path()),
                validated.contentType(),
                llmFallback
        );
    }

    private Resume upsertResume(Portfolio portfolio, UploadPortfolioRequestDTO request) {
        String bucket = trimToNull(request.getResumeRawFileBucket());
        String path = trimToNull(request.getResumeRawFilePath());
        if ((bucket == null) != (path == null)) {
            throw badRequest("Resume bucket and path must be supplied together");
        }
        if (bucket != null) {
            uploadPolicy.validateResumeObject(portfolio.getId(), bucket, path);
        }

        Resume resume = resumeRepository.findByPortfolioId(portfolio.getId()).orElse(new Resume());
        if (resume.getId() == null) {
            resume.setId(UUID.randomUUID());
            resume.setPortfolio(portfolio);
            resume.setCreatedAt(OffsetDateTime.now());
        }
        if (bucket != null) {
            resume.setRawFileBucket(bucket);
            resume.setRawFilePath(path);
        }
        return resumeRepository.save(resume);
    }

    private Portfolio requireOwnedPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Portfolio not found"
                ));
        if (!portfolio.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return portfolio;
    }

    private String fileName(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

}
