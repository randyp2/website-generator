package com.webgen.webgen_backend.portfolio.dto;

import com.webgen.webgen_backend.portfolio.dto.common.GlobalThemeDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioExportRequestDTO {
    private List<SectionDTO> sections;
    private GlobalThemeDTO globalTheme;
    private String pageTitle;
}
