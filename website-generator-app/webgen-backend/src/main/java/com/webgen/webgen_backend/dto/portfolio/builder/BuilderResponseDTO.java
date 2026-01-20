package com.webgen.webgen_backend.dto.portfolio.builder;

import com.webgen.webgen_backend.dto.portfolio.GlobalThemeDTO;
import lombok.Data;
import java.util.List;

@Data
public class BuilderResponseDTO {
    private List<ModifiedSectionDTO> modifiedSections;
    private String buildSummary;
    private GlobalThemeDTO globalTheme;  // Optional: only present if theme was changed
}
