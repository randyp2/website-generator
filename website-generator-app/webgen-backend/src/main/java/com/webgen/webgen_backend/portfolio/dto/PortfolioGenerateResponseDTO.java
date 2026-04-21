package com.webgen.webgen_backend.portfolio.dto;

import com.webgen.webgen_backend.portfolio.dto.common.AssistantMessageDTO;
import com.webgen.webgen_backend.portfolio.dto.common.GlobalThemeDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioGenerateResponseDTO {
    String previewUrl;
    List<SectionDTO> sections;
    AssistantMessageDTO assistantMessage;
    GlobalThemeDTO globalTheme;
}
