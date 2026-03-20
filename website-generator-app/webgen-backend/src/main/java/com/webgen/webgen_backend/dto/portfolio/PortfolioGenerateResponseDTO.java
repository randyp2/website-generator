package com.webgen.webgen_backend.dto.portfolio;

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
