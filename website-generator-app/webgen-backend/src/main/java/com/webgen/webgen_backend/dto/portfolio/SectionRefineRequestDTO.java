package com.webgen.webgen_backend.dto.portfolio;

import com.webgen.webgen_backend.dto.portfolio.common.SectionDTO;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SectionRefineRequestDTO {
    UUID portfolioId;
    String sectionKey;
    String userPrompt;
    SectionDTO currentSection;
    List<SectionDTO> contextSections; // Optional: send contex
}
