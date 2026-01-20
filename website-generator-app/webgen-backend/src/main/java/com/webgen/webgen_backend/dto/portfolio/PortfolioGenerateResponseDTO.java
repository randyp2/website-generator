package com.webgen.webgen_backend.dto.portfolio;

import lombok.Data;

import java.util.List;

@Data
public class PortfolioGenerateResponseDTO {
    String previewUrl;
    List<SectionDTO> sections;
    AssistantMessageDTO assistantMessage;
    GlobalThemeDTO globalTheme;
}
