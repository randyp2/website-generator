package com.webgen.webgen_backend.dto.portfolio.builder;

import com.webgen.webgen_backend.dto.portfolio.GlobalThemeDTO;
import lombok.Data;
import java.util.List;

@Data
public class BuilderResponseDTO {
    private String jobId; // For polling
    private List<ModifiedSectionDTO> modifiedSections;
    private List<String> deletedSectionKeys;
    private String buildSummary;
    private GlobalThemeDTO globalTheme;  // Optional: only present if theme was changed
}
