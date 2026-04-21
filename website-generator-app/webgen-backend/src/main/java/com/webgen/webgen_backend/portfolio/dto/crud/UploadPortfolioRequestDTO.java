package com.webgen.webgen_backend.portfolio.dto.crud;

import com.webgen.webgen_backend.portfolio.dto.common.AssetDTO;
import lombok.Data;

import java.util.List;

@Data
public class UploadPortfolioRequestDTO {
    private String resumeRawFileBucket;
    private String resumeRawFilePath;
    private List<AssetDTO> assets;
    private String templateId;
    private String lastStep;
}
