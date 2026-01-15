package com.webgen.webgen_backend.dto.portfolio.clarifier;

import lombok.Data;

import java.util.List;

@Data
public class ClarifierRequestDTO {
    private String userPrompt;
    private List<SectionSummaryDTO> sections;
}
