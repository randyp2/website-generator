package com.webgen.webgen_backend.dto.portfolio.crud;

import com.webgen.webgen_backend.dto.portfolio.common.AssetDTO;
import lombok.Data;

import java.util.List;

@Data
public class UploadPortfolioRequestDTO {
    private String resumeRawFileUrl;
    private String resumeRawFileBucket;
    private String resumeRawFilePath;
    private List<AssetDTO> assets;
    private String templateId;
    private String lastStep;
}
