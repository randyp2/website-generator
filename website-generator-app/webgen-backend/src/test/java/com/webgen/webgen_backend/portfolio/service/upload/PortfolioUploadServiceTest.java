package com.webgen.webgen_backend.portfolio.service.upload;

import com.webgen.webgen_backend.account.service.AccountDeletionStateService;
import com.webgen.webgen_backend.portfolio.dto.crud.UploadPortfolioRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.CreatePortfolioUploadPresignRequestDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadDescriptorDTO;
import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadKind;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioUploadServiceTest {

    private static final UUID USER_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID PORTFOLIO_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    @Mock
    private PortfolioRepository portfolioRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private PortfolioMapper portfolioMapper;
    @Mock
    private ResumeMapper resumeMapper;
    @Mock
    private SupabaseStorageClient storageClient;
    @Mock
    private ResumeParserService resumeParserService;
    @Mock
    private AccountDeletionStateService accountDeletionStateService;

    private PortfolioUploadService service;
    private Portfolio portfolio;

    @BeforeEach
    void setUp() {
        service = new PortfolioUploadService(
                portfolioRepository,
                resumeRepository,
                assetRepository,
                portfolioMapper,
                resumeMapper,
                storageClient,
                new PortfolioUploadPolicy(storageClient),
                resumeParserService,
                accountDeletionStateService
        );
        portfolio = new Portfolio();
        portfolio.setId(PORTFOLIO_ID);
        portfolio.setUserId(USER_ID);
        when(portfolioRepository.findById(PORTFOLIO_ID)).thenReturn(Optional.of(portfolio));
    }

    @Test
    void createsServerScopedUploadInstructions() {
        PortfolioUploadDescriptorDTO file = new PortfolioUploadDescriptorDTO();
        file.setClientId("image-0");
        file.setKind(PortfolioUploadKind.IMAGE);
        file.setOriginalFileName("work.png");
        file.setContentType("image/png");
        file.setFileSizeBytes(1024);
        CreatePortfolioUploadPresignRequestDTO request =
                new CreatePortfolioUploadPresignRequestDTO();
        request.setFiles(List.of(file));
        when(storageClient.createSignedUpload(any(), any())).thenAnswer(invocation ->
                new SupabaseStorageClient.SignedUpload(
                        invocation.getArgument(0),
                        invocation.getArgument(1),
                        "signed-token"
                )
        );

        var response = service.createUploadInstructions(USER_ID, PORTFOLIO_ID, request);

        assertThat(response.getUploads()).singleElement().satisfies(upload -> {
            assertThat(upload.getClientId()).isEqualTo("image-0");
            assertThat(upload.getBucket()).isEqualTo("portfolio_uploads");
            assertThat(upload.getPath())
                    .startsWith("media/" + PORTFOLIO_ID + "/")
                    .endsWith(".png");
            assertThat(upload.getToken()).isEqualTo("signed-token");
        });
    }

    @Test
    void verifiesObjectsAndBuildsPublicUrlsDuringFinalization() {
        String resumePath = "resumes/" + PORTFOLIO_ID + "/resume.pdf";
        String imagePath = "media/" + PORTFOLIO_ID + "/work.png";
        when(storageClient.getObjectInfo("private_resumes", resumePath))
                .thenReturn(Optional.of(
                        new SupabaseStorageClient.ObjectInfo(2048, "application/pdf")
                ));
        when(storageClient.getObjectInfo("portfolio_uploads", imagePath))
                .thenReturn(Optional.of(
                        new SupabaseStorageClient.ObjectInfo(4096, "image/png")
                ));
        when(storageClient.publicObjectUrl("portfolio_uploads", imagePath))
                .thenReturn("https://storage.test/public/work.png");
        when(resumeRepository.findByPortfolioId(PORTFOLIO_ID)).thenReturn(Optional.empty());
        when(resumeRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(portfolioRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PortfolioUploadedAssetDTO asset = new PortfolioUploadedAssetDTO();
        asset.setKind(PortfolioUploadKind.IMAGE);
        asset.setStorageBucket("portfolio_uploads");
        asset.setStoragePath(imagePath);
        asset.setTitle("Work sample");
        UploadPortfolioRequestDTO request = new UploadPortfolioRequestDTO();
        request.setResumeRawFileBucket("private_resumes");
        request.setResumeRawFilePath(resumePath);
        request.setAssets(List.of(asset));
        request.setLastStep("review");

        var response = service.finalizeUploads(USER_ID, PORTFOLIO_ID, request);

        ArgumentCaptor<Asset> savedAsset = ArgumentCaptor.forClass(Asset.class);
        verify(assetRepository).save(savedAsset.capture());
        assertThat(savedAsset.getValue().getFileUrl())
                .isEqualTo("https://storage.test/public/work.png");
        assertThat(savedAsset.getValue().getFileType()).isEqualTo("image");
        assertThat(response.getAssetsUploaded()).isEqualTo(1);
        assertThat(portfolio.getLastStep()).isEqualTo("review");
    }

    @Test
    void rejectsStoragePathsOutsideOwnedPortfolioPrefix() {
        PortfolioUploadedAssetDTO asset = new PortfolioUploadedAssetDTO();
        asset.setKind(PortfolioUploadKind.IMAGE);
        asset.setStorageBucket("portfolio_uploads");
        asset.setStoragePath("media/another-portfolio/work.png");
        UploadPortfolioRequestDTO request = new UploadPortfolioRequestDTO();
        request.setAssets(List.of(asset));

        assertThatThrownBy(() -> service.finalizeUploads(USER_ID, PORTFOLIO_ID, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("outside the portfolio upload scope");
        verify(storageClient, never()).getObjectInfo(any(), any());
    }

    @Test
    void parsesOnlyTheFinalizedPrivateResume() {
        String resumePath = "resumes/" + PORTFOLIO_ID + "/resume.pdf";
        Resume resume = new Resume();
        resume.setRawFileBucket("private_resumes");
        resume.setRawFilePath(resumePath);
        when(resumeRepository.findByPortfolioId(PORTFOLIO_ID)).thenReturn(Optional.of(resume));
        when(storageClient.getObjectInfo("private_resumes", resumePath))
                .thenReturn(Optional.of(
                        new SupabaseStorageClient.ObjectInfo(3, "application/pdf")
                ));
        when(storageClient.downloadObject("private_resumes", resumePath))
                .thenReturn(new byte[]{1, 2, 3});
        ParsedResumeDTO parsed = new ParsedResumeDTO();
        when(resumeParserService.parseResume(
                any(byte[].class),
                any(),
                any(),
                any()
        )).thenReturn(parsed);

        assertThat(service.parseStoredResume(USER_ID, PORTFOLIO_ID, null)).isSameAs(parsed);
    }
}
