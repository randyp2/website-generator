package com.webgen.webgen_backend.portfolio.dto.crud;

import com.webgen.webgen_backend.portfolio.dto.upload.PortfolioUploadedAssetDTO;
import lombok.Data;

import java.util.List;

@Data
public class UploadPortfolioRequestDTO {
    private String resumeRawFileBucket;
    private String resumeRawFilePath;
    private List<PortfolioUploadedAssetDTO> assets;
    private String templateId;
    private String lastStep;
}
